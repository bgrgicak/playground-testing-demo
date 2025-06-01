import { __private__dont__use as l } from "@php-wasm/universal";
import { Semaphore as T, joinPaths as u, basename as y } from "@php-wasm/util";
import { logger as c } from "@php-wasm/logger";
function I(t, n, e = () => {
}) {
  function o() {
    n = b(n);
    const i = t[l].FS, s = R(i, (a) => {
      if (a.path.startsWith(n))
        e(a);
      else if (a.operation === "RENAME" && a.toPath.startsWith(n))
        for (const f of m(
          t,
          a.path,
          a.toPath
        ))
          e(f);
    }), d = {};
    for (const [a] of Object.entries(s))
      d[a] = i[a];
    function p() {
      for (const [a, f] of Object.entries(s))
        i[a] = function(...E) {
          return f(...E), d[a].apply(this, E);
        };
    }
    function h() {
      for (const [a, f] of Object.entries(d))
        t[l].FS[a] = f;
    }
    t[l].journal = {
      bind: p,
      unbind: h
    }, p();
  }
  t.addEventListener("runtime.initialized", o), t[l] && o();
  function r() {
    t[l].journal.unbind(), delete t[l].journal;
  }
  return t.addEventListener("runtime.beforedestroy", r), function() {
    return t.removeEventListener("runtime.initialized", o), t.removeEventListener("runtime.beforedestroy", r), t[l].journal.unbind();
  };
}
const R = (t, n = () => {
}) => ({
  write(e) {
    n({
      operation: "WRITE",
      path: e.path,
      nodeType: "file"
    });
  },
  truncate(e) {
    let o;
    typeof e == "string" ? o = t.lookupPath(e, {
      follow: !0
    }).node : o = e, n({
      operation: "WRITE",
      path: t.getPath(o),
      nodeType: "file"
    });
  },
  unlink(e) {
    n({
      operation: "DELETE",
      path: e,
      nodeType: "file"
    });
  },
  mknod(e, o) {
    t.isFile(o) && n({
      operation: "CREATE",
      path: e,
      nodeType: "file"
    });
  },
  mkdir(e) {
    n({
      operation: "CREATE",
      path: e,
      nodeType: "directory"
    });
  },
  rmdir(e) {
    n({
      operation: "DELETE",
      path: e,
      nodeType: "directory"
    });
  },
  rename(e, o) {
    try {
      const r = t.lookupPath(e, {
        follow: !0
      }), i = t.lookupPath(o, {
        parent: !0
      }).path;
      n({
        operation: "RENAME",
        nodeType: t.isDir(r.node.mode) ? "directory" : "file",
        path: r.path,
        toPath: u(i, y(o))
      });
    } catch {
    }
  }
});
function L(t, n) {
  t[l].journal.unbind();
  try {
    for (const e of n)
      e.operation === "CREATE" ? e.nodeType === "file" ? t.writeFile(e.path, " ") : t.mkdir(e.path) : e.operation === "DELETE" ? e.nodeType === "file" ? t.unlink(e.path) : t.rmdir(e.path) : e.operation === "WRITE" ? t.writeFile(e.path, e.data) : e.operation === "RENAME" && t.mv(e.path, e.toPath);
  } finally {
    t[l].journal.bind();
  }
}
function* m(t, n, e) {
  if (t.isDir(n)) {
    yield {
      operation: "CREATE",
      path: e,
      nodeType: "directory"
    };
    for (const o of t.listFiles(n))
      yield* m(
        t,
        u(n, o),
        u(e, o)
      );
  } else
    yield {
      operation: "CREATE",
      path: e,
      nodeType: "file"
    }, yield {
      operation: "WRITE",
      nodeType: "file",
      path: e
    };
}
function b(t) {
  return t.replace(/\/$/, "").replace(/\/\/+/g, "/");
}
function k(t) {
  const n = {};
  for (let e = t.length - 1; e >= 0; e--) {
    for (let o = e - 1; o >= 0; o--) {
      const r = A(t[e], t[o]);
      if (r === "none")
        continue;
      const i = t[e], s = t[o];
      if (i.operation === "RENAME" && s.operation === "RENAME") {
        c.warn(
          "[FS Journal] Normalizing a double rename is not yet supported:",
          {
            current: i,
            last: s
          }
        );
        continue;
      }
      (s.operation === "CREATE" || s.operation === "WRITE") && (i.operation === "RENAME" ? r === "same_node" ? (n[o] = [], n[e] = [
        {
          ...s,
          path: i.toPath
        },
        ...n[e] || []
      ]) : r === "descendant" && (n[o] = [], n[e] = [
        {
          ...s,
          path: u(
            i.toPath,
            s.path.substring(i.path.length)
          )
        },
        ...n[e] || []
      ]) : i.operation === "WRITE" && r === "same_node" ? n[o] = [] : i.operation === "DELETE" && r === "same_node" && (n[o] = [], n[e] = []));
    }
    if (Object.entries(n).length > 0) {
      const o = t.flatMap((r, i) => i in n ? n[i] : [r]);
      return k(o);
    }
  }
  return t;
}
function A(t, n) {
  const e = t.path, o = t.operation !== "WRITE" && t.nodeType === "directory", r = n.operation !== "WRITE" && n.nodeType === "directory", i = n.operation === "RENAME" ? n.toPath : n.path;
  return i === e ? "same_node" : r && e.startsWith(i + "/") ? "ancestor" : o && i.startsWith(e + "/") ? "descendant" : "none";
}
async function O(t, n) {
  const o = n.filter(
    (r) => r.operation === "WRITE"
  ).map((r) => P(t, r));
  return await Promise.all(o), n;
}
const F = new T({ concurrency: 15 });
async function P(t, n) {
  const e = await F.acquire();
  try {
    n.data = await t.readFileAsBuffer(n.path);
  } catch (o) {
    c.warn(
      `Journal failed to hydrate a file on flush: the path ${n.path} no longer exists`
    ), c.error(o);
  }
  e();
}
export {
  O as hydrateUpdateFileOps,
  I as journalFSEvents,
  k as normalizeFilesystemOperations,
  L as replayFSJournal
};
//# sourceMappingURL=index.js.map
