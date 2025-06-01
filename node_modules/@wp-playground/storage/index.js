import { Semaphore as Lt, normalizePath as Mt, joinPaths as Ee } from "@php-wasm/util";
import { Octokit as Ie } from "octokit";
import _e from "crc-32";
import vt from "pako";
function jr(n) {
  return new Ie({
    auth: n
  });
}
function Lr(n, r = "") {
  r.length && !r.endsWith("/") && (r += "/");
  const o = {};
  for (const s of n)
    s.path.startsWith(r) && (o[s.path.substring(r.length)] = s.content);
  return o;
}
async function Ae(n, r, o, s, u, f = {}) {
  f.progress || (f.progress = {
    foundFiles: 0,
    downloadedFiles: 0
  });
  const { onProgress: h } = f, a = [], w = [], { data: y } = await n.rest.repos.getContent({
    owner: r,
    repo: o,
    path: u,
    ref: s
  });
  if (!Array.isArray(y))
    throw new Error(
      `Expected the list of files to be an array, but got ${typeof y}`
    );
  for (const b of y)
    b.type === "file" ? (++f.progress.foundFiles, h == null || h(f.progress), a.push(
      Ue(n, r, o, s, b).then((B) => (++f.progress.downloadedFiles, h == null || h(f.progress), B))
    )) : b.type === "dir" && w.push(
      Ae(
        n,
        r,
        o,
        s,
        b.path,
        f
      )
    );
  const g = await Promise.all(a), m = (await Promise.all(w)).flatMap(
    (b) => b
  );
  return [...g, ...m];
}
const Fe = new Lt({ concurrency: 15 });
async function Ue(n, r, o, s, u) {
  const f = await Fe.acquire();
  try {
    const { data: h } = await n.rest.repos.getContent({
      owner: r,
      repo: o,
      ref: s,
      path: u.path
    });
    if (!("content" in h))
      throw new Error(`No content found for ${u.path}`);
    return {
      name: u.name,
      path: u.path,
      content: Se(h.content)
    };
  } finally {
    f();
  }
}
function Se(n) {
  const r = window.atob(n), o = r.length, s = new Uint8Array(o);
  for (let u = 0; u < o; u++)
    s[u] = r.charCodeAt(u);
  return s;
}
async function Mr(n, r, o, s, u) {
  var g;
  const { data: f } = await n.rest.pulls.get({
    owner: r,
    repo: o,
    pull_number: s
  }), a = (g = (await n.rest.actions.listWorkflowRuns({
    owner: r,
    repo: o,
    branch: f.head.ref,
    workflow_id: u
  })).data.workflow_runs[0]) == null ? void 0 : g.id, w = await n.rest.actions.listWorkflowRunArtifacts({
    owner: r,
    repo: o,
    run_id: a
  });
  return (await n.rest.actions.downloadArtifact({
    owner: r,
    repo: o,
    artifact_id: w.data.artifacts[0].id,
    archive_format: "zip"
  })).data;
}
async function vr(n, r, o) {
  var f;
  const { data: s, headers: u } = await n.request(
    "GET /repos/{owner}/{repo}",
    {
      owner: r,
      repo: o
    }
  );
  return !(!u["x-oauth-scopes"] || !((f = s.permissions) != null && f.push));
}
async function Gr(n, r, o, s, u) {
  await n.request("GET /repos/{owner}/{repo}/branches/{branch}", {
    owner: r,
    repo: o,
    branch: s
  }).then(
    () => !0,
    () => !1
  ) ? await n.request("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
    owner: r,
    repo: o,
    sha: u,
    ref: `heads/${s}`
  }) : await n.request("POST /repos/{owner}/{repo}/git/refs", {
    owner: r,
    repo: o,
    sha: u,
    ref: `refs/heads/${s}`
  });
}
async function Hr(n, r, o) {
  const s = await n.request("GET /user");
  return (await n.request("GET /repos/{owner}/{repo}/forks", {
    owner: r,
    repo: o
  })).data.find(
    (h) => h.owner && h.owner.login === s.data.login
  ) || await n.request("POST /repos/{owner}/{repo}/forks", {
    owner: r,
    repo: o
  }), s.data.login;
}
async function qr(n, r, o, s, u, f) {
  const {
    data: { sha: h }
  } = await n.request("POST /repos/{owner}/{repo}/git/commits", {
    owner: r,
    repo: o,
    message: s,
    tree: f,
    parents: [u]
  });
  return h;
}
async function zr(n, r, o, s, u) {
  const f = await ke(
    n,
    r,
    o,
    s,
    u
  );
  if (f.length === 0)
    return null;
  const {
    data: { sha: h }
  } = await n.request("POST /repos/{owner}/{repo}/git/trees", {
    owner: r,
    repo: o,
    base_tree: s,
    tree: f
  });
  return h;
}
async function ke(n, r, o, s, u) {
  const f = [];
  for (const [h, a] of u.create)
    f.push(Ct(n, r, o, h, a));
  for (const [h, a] of u.update)
    f.push(Ct(n, r, o, h, a));
  for (const h of u.delete)
    f.push(Te(n, r, o, s, h));
  return Promise.all(f).then(
    (h) => h.filter((a) => !!a)
  );
}
const Gt = new Lt({ concurrency: 10 });
async function Ct(n, r, o, s, u) {
  const f = await Gt.acquire();
  try {
    if (ArrayBuffer.isView(u))
      try {
        const h = new TextDecoder("utf-8", {
          fatal: !0
        }).decode(u);
        return {
          path: s,
          content: h,
          mode: "100644"
        };
      } catch {
        const {
          data: { sha: a }
        } = await n.rest.git.createBlob({
          owner: r,
          repo: o,
          encoding: "base64",
          content: $e(u)
        });
        return {
          path: s,
          sha: a,
          mode: "100644"
        };
      }
    else
      return {
        path: s,
        content: u,
        mode: "100644"
      };
  } finally {
    f();
  }
}
async function Te(n, r, o, s, u) {
  const f = await Gt.acquire();
  try {
    return await n.request("HEAD /repos/{owner}/{repo}/contents/:path", {
      owner: r,
      repo: o,
      ref: s,
      path: u
    }), {
      path: u,
      mode: "100644",
      sha: null
    };
  } catch {
    return;
  } finally {
    f();
  }
}
function $e(n) {
  const r = [], o = n.byteLength;
  for (let s = 0; s < o; s++)
    r.push(String.fromCharCode(n[s]));
  return window.btoa(r.join(""));
}
async function* Wr(n, r, { exceptPaths: o = [] } = {}) {
  if (r = Mt(r), !await n.isDir(r)) {
    await n.fileExists(r) && (yield {
      path: r,
      read: async () => await n.readFileAsBuffer(r)
    });
    return;
  }
  const s = [r];
  for (; s.length; ) {
    const u = s.pop();
    if (!u)
      return;
    const f = await n.listFiles(u);
    for (const h of f) {
      const a = Ee(u, h);
      o.includes(a.substring(r.length + 1)) || (await n.isDir(a) ? s.push(a) : yield {
        path: a,
        read: async () => await n.readFileAsBuffer(a)
      });
    }
  }
}
async function Yr(n, r) {
  const o = {
    create: /* @__PURE__ */ new Map(),
    update: /* @__PURE__ */ new Map(),
    delete: /* @__PURE__ */ new Set()
  }, s = /* @__PURE__ */ new Set();
  for await (const u of r) {
    s.add(u.path);
    const f = n.get(u.path), h = await u.read();
    f ? Re(f, h) || o.update.set(u.path, h) : o.create.set(u.path, h);
  }
  for (const u of n.keys())
    s.has(u) || o.delete.add(u);
  return o;
}
function Re(n, r) {
  return n.length === r.length && n.every((o, s) => o === r[s]);
}
async function Ce(n) {
  return n.type === "local-fs" ? n.handle : Oe(n.path);
}
async function Oe(n) {
  const r = n.split("/").filter((s) => s.length > 0);
  let o = await navigator.storage.getDirectory();
  for (const s of r)
    o = await o.getDirectoryHandle(s, { create: !0 });
  return o;
}
async function Vr(n) {
  const o = await (await navigator.storage.getDirectory()).resolve(n);
  if (o === null)
    throw new DOMException(
      "Unable to resolve path of OPFS directory handle.",
      "NotFoundError"
    );
  return "/" + o.join("/");
}
async function Kr(n) {
  const r = await Ce(n);
  for await (const o of r.keys())
    await r.removeEntry(o, {
      recursive: !0
    });
}
function Pe(n) {
  let r = [n];
  return {
    next() {
      return Promise.resolve({ done: r.length === 0, value: r.pop() });
    },
    return() {
      return r = [], {};
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
function Ht(n) {
  return n[Symbol.asyncIterator] ? n[Symbol.asyncIterator]() : n[Symbol.iterator] ? n[Symbol.iterator]() : n.next ? n : Pe(n);
}
class qt {
  constructor(r) {
    if (typeof Buffer > "u")
      throw new Error("Missing Buffer dependency");
    this.stream = Ht(r), this.buffer = null, this.cursor = 0, this.undoCursor = 0, this.started = !1, this._ended = !1, this._discardedBytes = 0;
  }
  eof() {
    return this._ended && this.cursor === this.buffer.length;
  }
  tell() {
    return this._discardedBytes + this.cursor;
  }
  async byte() {
    if (!this.eof() && (this.started || await this._init(), !(this.cursor === this.buffer.length && (await this._loadnext(), this._ended))))
      return this._moveCursor(1), this.buffer[this.undoCursor];
  }
  async chunk() {
    if (!this.eof() && (this.started || await this._init(), !(this.cursor === this.buffer.length && (await this._loadnext(), this._ended))))
      return this._moveCursor(this.buffer.length), this.buffer.slice(this.undoCursor, this.cursor);
  }
  async read(r) {
    if (!this.eof())
      return this.started || await this._init(), this.cursor + r > this.buffer.length && (this._trim(), await this._accumulate(r)), this._moveCursor(r), this.buffer.slice(this.undoCursor, this.cursor);
  }
  async skip(r) {
    this.eof() || (this.started || await this._init(), this.cursor + r > this.buffer.length && (this._trim(), await this._accumulate(r)), this._moveCursor(r));
  }
  async undo() {
    this.cursor = this.undoCursor;
  }
  async _next() {
    this.started = !0;
    let { done: r, value: o } = await this.stream.next();
    return r && (this._ended = !0, !o) ? Buffer.alloc(0) : (o && (o = Buffer.from(o)), o);
  }
  _trim() {
    this.buffer = this.buffer.slice(this.undoCursor), this.cursor -= this.undoCursor, this._discardedBytes += this.undoCursor, this.undoCursor = 0;
  }
  _moveCursor(r) {
    this.undoCursor = this.cursor, this.cursor += r, this.cursor > this.buffer.length && (this.cursor = this.buffer.length);
  }
  async _accumulate(r) {
    if (this._ended)
      return;
    const o = [this.buffer];
    for (; this.cursor + r > Ne(o); ) {
      const s = await this._next();
      if (this._ended)
        break;
      o.push(s);
    }
    this.buffer = Buffer.concat(o);
  }
  async _loadnext() {
    this._discardedBytes += this.buffer.length, this.undoCursor = 0, this.cursor = 0, this.buffer = await this._next();
  }
  async _init() {
    this.buffer = await this._next();
  }
}
function Ne(n) {
  return n.reduce((r, o) => r + o.length, 0);
}
function De(n, r) {
  const o = r.toString(16);
  return "0".repeat(n - o.length) + o;
}
class k {
  static flush() {
    return Buffer.from("0000", "utf8");
  }
  static delim() {
    return Buffer.from("0001", "utf8");
  }
  static encode(r) {
    typeof r == "string" && (r = Buffer.from(r));
    const o = r.length + 4, s = De(4, o);
    return Buffer.concat([Buffer.from(s, "utf8"), r]);
  }
  static streamReader(r) {
    const o = new qt(r);
    return async function() {
      try {
        let u = await o.read(4);
        if (u == null)
          return !0;
        if (u = parseInt(u.toString("utf8"), 16), u === 0 || u === 1)
          return null;
        const f = await o.read(u - 4);
        return f ?? !0;
      } catch (u) {
        return r.error = u, !0;
      }
    };
  }
}
class J extends Error {
  constructor(r) {
    super(r), this.caller = "";
  }
  toJSON() {
    return {
      code: this.code,
      data: this.data,
      caller: this.caller,
      message: this.message,
      stack: this.stack
    };
  }
  fromJSON(r) {
    const o = new J(r.message);
    return o.code = r.code, o.data = r.data, o.caller = r.caller, o.stack = r.stack, o;
  }
  get isIsomorphicGitError() {
    return !0;
  }
}
class _ extends J {
  /**
   * @param {string} message
   */
  constructor(r) {
    super(
      `An internal error caused this command to fail. Please file a bug report at https://github.com/isomorphic-git/isomorphic-git/issues with this error message: ${r}`
    ), this.code = this.name = _.code, this.data = { message: r };
  }
}
_.code = "InternalError";
class ot extends J {
  /**
   * @param {string} filepath
   */
  constructor(r) {
    super(`The filepath "${r}" contains unsafe character sequences`), this.code = this.name = ot.code, this.data = { filepath: r };
  }
}
ot.code = "UnsafeFilepathError";
function zt(n, r) {
  return -(n < r) || +(n > r);
}
function je(n, r) {
  return zt(n.path, r.path);
}
function Le(n, r) {
  return zt(Ot(n), Ot(r));
}
function Ot(n) {
  return n.mode === "040000" ? n.path + "/" : n.path;
}
function Wt(n) {
  switch (n) {
    case "040000":
      return "tree";
    case "100644":
      return "blob";
    case "100755":
      return "blob";
    case "120000":
      return "blob";
    case "160000":
      return "commit";
  }
  throw new _(`Unexpected GitTree entry mode: ${n}`);
}
function Me(n) {
  const r = [];
  let o = 0;
  for (; o < n.length; ) {
    const s = n.indexOf(32, o);
    if (s === -1)
      throw new _(
        `GitTree: Error parsing buffer at byte location ${o}: Could not find the next space character.`
      );
    const u = n.indexOf(0, o);
    if (u === -1)
      throw new _(
        `GitTree: Error parsing buffer at byte location ${o}: Could not find the next null character.`
      );
    let f = n.slice(o, s).toString("utf8");
    f === "40000" && (f = "040000");
    const h = Wt(f), a = n.slice(s + 1, u).toString("utf8");
    if (a.includes("\\") || a.includes("/"))
      throw new ot(a);
    const w = n.slice(u + 1, u + 21).toString("hex");
    o = u + 21, r.push({ mode: f, path: a, oid: w, type: h });
  }
  return r;
}
function ve(n) {
  if (typeof n == "number" && (n = n.toString(8)), n.match(/^0?4.*/))
    return "040000";
  if (n.match(/^1006.*/))
    return "100644";
  if (n.match(/^1007.*/))
    return "100755";
  if (n.match(/^120.*/))
    return "120000";
  if (n.match(/^160.*/))
    return "160000";
  throw new _(`Could not understand file mode: ${n}`);
}
function Ge(n) {
  return !n.oid && n.sha && (n.oid = n.sha), n.mode = ve(n.mode), n.type || (n.type = Wt(n.mode)), n;
}
class bt {
  constructor(r) {
    if (Buffer.isBuffer(r))
      this._entries = Me(r);
    else if (Array.isArray(r))
      this._entries = r.map(Ge);
    else
      throw new _("invalid type passed to GitTree constructor");
    this._entries.sort(je);
  }
  static from(r) {
    return new bt(r);
  }
  render() {
    return this._entries.map((r) => `${r.mode} ${r.type} ${r.oid}    ${r.path}`).join(`
`);
  }
  toObject() {
    const r = [...this._entries];
    return r.sort(Le), Buffer.concat(
      r.map((o) => {
        const s = Buffer.from(o.mode.replace(/^0/, "")), u = Buffer.from(" "), f = Buffer.from(o.path, "utf8"), h = Buffer.from([0]), a = Buffer.from(o.oid, "hex");
        return Buffer.concat([s, u, f, h, a]);
      })
    );
  }
  /**
   * @returns {TreeEntry[]}
   */
  entries() {
    return this._entries;
  }
  *[Symbol.iterator]() {
    for (const r of this._entries)
      yield r;
  }
}
function yt({ name: n, email: r, timestamp: o, timezoneOffset: s }) {
  return s = He(s), `${n} <${r}> ${o} ${s}`;
}
function He(n) {
  const r = qe(ze(n));
  n = Math.abs(n);
  const o = Math.floor(n / 60);
  n -= o * 60;
  let s = String(o), u = String(n);
  return s.length < 2 && (s = "0" + s), u.length < 2 && (u = "0" + u), (r === -1 ? "-" : "+") + s + u;
}
function qe(n) {
  return Math.sign(n) || (Object.is(n, -0) ? -1 : 1);
}
function ze(n) {
  return n === 0 ? n : -n;
}
function G(n) {
  return n = n.replace(/\r/g, ""), n = n.replace(/^\n+/, ""), n = n.replace(/\n+$/, "") + `
`, n;
}
function it(n) {
  const [, r, o, s, u] = n.match(
    /^(.*) <(.*)> (.*) (.*)$/
  );
  return {
    name: r,
    email: o,
    timestamp: Number(s),
    timezoneOffset: We(u)
  };
}
function We(n) {
  let [, r, o, s] = n.match(/(\+|-)(\d\d)(\d\d)/);
  return s = (r === "+" ? 1 : -1) * (Number(o) * 60 + Number(s)), Ye(s);
}
function Ye(n) {
  return n === 0 ? n : -n;
}
class Z {
  constructor(r) {
    if (typeof r == "string")
      this._tag = r;
    else if (Buffer.isBuffer(r))
      this._tag = r.toString("utf8");
    else if (typeof r == "object")
      this._tag = Z.render(r);
    else
      throw new _(
        "invalid type passed to GitAnnotatedTag constructor"
      );
  }
  static from(r) {
    return new Z(r);
  }
  static render(r) {
    return `object ${r.object}
type ${r.type}
tag ${r.tag}
tagger ${yt(r.tagger)}

${r.message}
${r.gpgsig ? r.gpgsig : ""}`;
  }
  justHeaders() {
    return this._tag.slice(0, this._tag.indexOf(`

`));
  }
  message() {
    const r = this.withoutSignature();
    return r.slice(r.indexOf(`

`) + 2);
  }
  parse() {
    return Object.assign(this.headers(), {
      message: this.message(),
      gpgsig: this.gpgsig()
    });
  }
  render() {
    return this._tag;
  }
  headers() {
    const r = this.justHeaders().split(`
`), o = [];
    for (const u of r)
      u[0] === " " ? o[o.length - 1] += `
` + u.slice(1) : o.push(u);
    const s = {};
    for (const u of o) {
      const f = u.slice(0, u.indexOf(" ")), h = u.slice(u.indexOf(" ") + 1);
      Array.isArray(s[f]) ? s[f].push(h) : s[f] = h;
    }
    return s.tagger && (s.tagger = it(s.tagger)), s.committer && (s.committer = it(s.committer)), s;
  }
  withoutSignature() {
    const r = G(this._tag);
    return r.indexOf(`
-----BEGIN PGP SIGNATURE-----`) === -1 ? r : r.slice(0, r.lastIndexOf(`
-----BEGIN PGP SIGNATURE-----`));
  }
  gpgsig() {
    if (this._tag.indexOf(`
-----BEGIN PGP SIGNATURE-----`) === -1)
      return;
    const r = this._tag.slice(
      this._tag.indexOf("-----BEGIN PGP SIGNATURE-----"),
      this._tag.indexOf("-----END PGP SIGNATURE-----") + 27
    );
    return G(r);
  }
  payload() {
    return this.withoutSignature() + `
`;
  }
  toObject() {
    return Buffer.from(this._tag, "utf8");
  }
  static async sign(r, o, s) {
    const u = r.payload();
    let { signature: f } = await o({ payload: u, secretKey: s });
    f = G(f);
    const h = u + f;
    return Z.from(h);
  }
}
function lt(n) {
  return n.trim().split(`
`).map((r) => " " + r).join(`
`) + `
`;
}
function Ve(n) {
  return n.split(`
`).map((r) => r.replace(/^ /, "")).join(`
`);
}
class O {
  constructor(r) {
    if (typeof r == "string")
      this._commit = r;
    else if (Buffer.isBuffer(r))
      this._commit = r.toString("utf8");
    else if (typeof r == "object")
      this._commit = O.render(r);
    else
      throw new _("invalid type passed to GitCommit constructor");
  }
  static fromPayloadSignature({ payload: r, signature: o }) {
    const s = O.justHeaders(r), u = O.justMessage(r), f = G(
      s + `
gpgsig` + lt(o) + `
` + u
    );
    return new O(f);
  }
  static from(r) {
    return new O(r);
  }
  toObject() {
    return Buffer.from(this._commit, "utf8");
  }
  // Todo: allow setting the headers and message
  headers() {
    return this.parseHeaders();
  }
  // Todo: allow setting the headers and message
  message() {
    return O.justMessage(this._commit);
  }
  parse() {
    return Object.assign({ message: this.message() }, this.headers());
  }
  static justMessage(r) {
    return G(r.slice(r.indexOf(`

`) + 2));
  }
  static justHeaders(r) {
    return r.slice(0, r.indexOf(`

`));
  }
  parseHeaders() {
    const r = O.justHeaders(this._commit).split(`
`), o = [];
    for (const u of r)
      u[0] === " " ? o[o.length - 1] += `
` + u.slice(1) : o.push(u);
    const s = {
      parent: []
    };
    for (const u of o) {
      const f = u.slice(0, u.indexOf(" ")), h = u.slice(u.indexOf(" ") + 1);
      Array.isArray(s[f]) ? s[f].push(h) : s[f] = h;
    }
    return s.author && (s.author = it(s.author)), s.committer && (s.committer = it(s.committer)), s;
  }
  static renderHeaders(r) {
    let o = "";
    if (r.tree ? o += `tree ${r.tree}
` : o += `tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
`, r.parent) {
      if (r.parent.length === void 0)
        throw new _("commit 'parent' property should be an array");
      for (const f of r.parent)
        o += `parent ${f}
`;
    }
    const s = r.author;
    o += `author ${yt(s)}
`;
    const u = r.committer || r.author;
    return o += `committer ${yt(u)}
`, r.gpgsig && (o += "gpgsig" + lt(r.gpgsig)), o;
  }
  static render(r) {
    return O.renderHeaders(r) + `
` + G(r.message);
  }
  render() {
    return this._commit;
  }
  withoutSignature() {
    const r = G(this._commit);
    if (r.indexOf(`
gpgsig`) === -1)
      return r;
    const o = r.slice(0, r.indexOf(`
gpgsig`)), s = r.slice(
      r.indexOf(`-----END PGP SIGNATURE-----
`) + 28
    );
    return G(o + `
` + s);
  }
  isolateSignature() {
    const r = this._commit.slice(
      this._commit.indexOf("-----BEGIN PGP SIGNATURE-----"),
      this._commit.indexOf("-----END PGP SIGNATURE-----") + 27
    );
    return Ve(r);
  }
  static async sign(r, o, s) {
    const u = r.withoutSignature(), f = O.justMessage(r._commit);
    let { signature: h } = await o({ payload: u, secretKey: s });
    h = G(h);
    const w = O.justHeaders(r._commit) + `
gpgsig` + lt(h) + `
` + f;
    return O.from(w);
  }
}
class Ke {
  static wrap({ type: r, object: o }) {
    return Buffer.concat([
      Buffer.from(`${r} ${o.byteLength.toString()}\0`),
      Buffer.from(o)
    ]);
  }
  static unwrap(r) {
    const o = r.indexOf(32), s = r.indexOf(0), u = r.slice(0, o).toString("utf8"), f = r.slice(o + 1, s).toString("utf8"), h = r.length - (s + 1);
    if (parseInt(f) !== h)
      throw new _(
        `Length mismatch: expected ${f} bytes but got ${h} instead.`
      );
    return {
      type: u,
      object: Buffer.from(r.slice(s + 1))
    };
  }
}
class z {
  constructor(r) {
    this.buffer = r, this._start = 0;
  }
  eof() {
    return this._start >= this.buffer.length;
  }
  tell() {
    return this._start;
  }
  seek(r) {
    this._start = r;
  }
  slice(r) {
    const o = this.buffer.slice(this._start, this._start + r);
    return this._start += r, o;
  }
  toString(r, o) {
    const s = this.buffer.toString(r, this._start, this._start + o);
    return this._start += o, s;
  }
  write(r, o, s) {
    const u = this.buffer.write(r, this._start, o, s);
    return this._start += o, u;
  }
  copy(r, o, s) {
    const u = r.copy(this.buffer, this._start, o, s);
    return this._start += u, u;
  }
  readUInt8() {
    const r = this.buffer.readUInt8(this._start);
    return this._start += 1, r;
  }
  writeUInt8(r) {
    const o = this.buffer.writeUInt8(r, this._start);
    return this._start += 1, o;
  }
  readUInt16BE() {
    const r = this.buffer.readUInt16BE(this._start);
    return this._start += 2, r;
  }
  writeUInt16BE(r) {
    const o = this.buffer.writeUInt16BE(r, this._start);
    return this._start += 2, o;
  }
  readUInt32BE() {
    const r = this.buffer.readUInt32BE(this._start);
    return this._start += 4, r;
  }
  writeUInt32BE(r) {
    const o = this.buffer.writeUInt32BE(r, this._start);
    return this._start += 4, o;
  }
}
function Je(n, r) {
  const o = new z(n), s = Pt(o);
  if (s !== r.byteLength)
    throw new _(
      `applyDelta expected source buffer to be ${s} bytes but the provided buffer was ${r.length} bytes`
    );
  const u = Pt(o);
  let f;
  const h = Dt(o, r);
  if (h.byteLength === u)
    f = h;
  else {
    f = Buffer.alloc(u);
    const a = new z(f);
    for (a.copy(h); !o.eof(); )
      a.copy(Dt(o, r));
    const w = a.tell();
    if (u !== w)
      throw new _(
        `applyDelta expected target buffer to be ${u} bytes but the resulting buffer was ${w} bytes`
      );
  }
  return f;
}
function Pt(n) {
  let r = 0, o = 0, s = null;
  do
    s = n.readUInt8(), r |= (s & 127) << o, o += 7;
  while (s & 128);
  return r;
}
function Nt(n, r, o) {
  let s = 0, u = 0;
  for (; o--; )
    r & 1 && (s |= n.readUInt8() << u), r >>= 1, u += 8;
  return s;
}
function Dt(n, r) {
  const o = n.readUInt8(), s = 128, u = 15, f = 112;
  if (o & s) {
    const h = Nt(n, o & u, 4);
    let a = Nt(n, (o & f) >> 4, 3);
    return a === 0 && (a = 65536), r.slice(h, h + a);
  } else
    return n.slice(o);
}
async function Xe(n, r) {
  const o = new qt(n);
  let s = await o.read(4);
  if (s = s.toString("utf8"), s !== "PACK")
    throw new _(`Invalid PACK header '${s}'`);
  let u = await o.read(4);
  if (u = u.readUInt32BE(0), u !== 2)
    throw new _(`Invalid packfile version: ${u}`);
  let f = await o.read(4);
  if (f = f.readUInt32BE(0), !(f < 1))
    for (; !o.eof() && f--; ) {
      const h = o.tell(), { type: a, length: w, ofs: y, reference: g } = await Ze(o), m = new vt.Inflate();
      for (; !m.result; ) {
        const b = await o.chunk();
        if (!b)
          break;
        if (m.push(b, !1), m.err)
          throw new _(`Pako error: ${m.msg}`);
        if (m.result) {
          if (m.result.length !== w)
            throw new _(
              "Inflated object size is different from that stated in packfile."
            );
          await o.undo(), await o.read(b.length - m.strm.avail_in);
          const B = o.tell();
          await r({
            data: m.result,
            type: a,
            num: f,
            offset: h,
            end: B,
            reference: g,
            ofs: y
          });
        }
      }
    }
}
async function Ze(n) {
  let r = await n.byte();
  const o = r >> 4 & 7;
  let s = r & 15;
  if (r & 128) {
    let h = 4;
    do
      r = await n.byte(), s |= (r & 127) << h, h += 7;
    while (r & 128);
  }
  let u, f;
  if (o === 6) {
    let h = 0;
    u = 0;
    const a = [];
    do
      r = await n.byte(), u |= (r & 127) << h, h += 7, a.push(r);
    while (r & 128);
    f = Buffer.from(a);
  }
  return o === 7 && (f = await n.read(20)), { type: o, length: s, ofs: u, reference: f };
}
let Qe = !1;
async function tr(n) {
  return Qe ? er(n) : vt.inflate(n);
}
async function er(n) {
  const r = new DecompressionStream("deflate"), o = new Blob([n]).stream().pipeThrough(r);
  return new Uint8Array(await new Response(o).arrayBuffer());
}
function rr(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var gt = { exports: {} };
typeof Object.create == "function" ? gt.exports = function(r, o) {
  o && (r.super_ = o, r.prototype = Object.create(o.prototype, {
    constructor: {
      value: r,
      enumerable: !1,
      writable: !0,
      configurable: !0
    }
  }));
} : gt.exports = function(r, o) {
  if (o) {
    r.super_ = o;
    var s = function() {
    };
    s.prototype = o.prototype, r.prototype = new s(), r.prototype.constructor = r;
  }
};
var nr = gt.exports, mt = { exports: {} }, H = {}, st = {};
st.byteLength = sr;
st.toByteArray = cr;
st.fromByteArray = hr;
var j = [], P = [], ir = typeof Uint8Array < "u" ? Uint8Array : Array, pt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var K = 0, or = pt.length; K < or; ++K)
  j[K] = pt[K], P[pt.charCodeAt(K)] = K;
P["-".charCodeAt(0)] = 62;
P["_".charCodeAt(0)] = 63;
function Yt(n) {
  var r = n.length;
  if (r % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var o = n.indexOf("=");
  o === -1 && (o = r);
  var s = o === r ? 0 : 4 - o % 4;
  return [o, s];
}
function sr(n) {
  var r = Yt(n), o = r[0], s = r[1];
  return (o + s) * 3 / 4 - s;
}
function ar(n, r, o) {
  return (r + o) * 3 / 4 - o;
}
function cr(n) {
  var r, o = Yt(n), s = o[0], u = o[1], f = new ir(ar(n, s, u)), h = 0, a = u > 0 ? s - 4 : s, w;
  for (w = 0; w < a; w += 4)
    r = P[n.charCodeAt(w)] << 18 | P[n.charCodeAt(w + 1)] << 12 | P[n.charCodeAt(w + 2)] << 6 | P[n.charCodeAt(w + 3)], f[h++] = r >> 16 & 255, f[h++] = r >> 8 & 255, f[h++] = r & 255;
  return u === 2 && (r = P[n.charCodeAt(w)] << 2 | P[n.charCodeAt(w + 1)] >> 4, f[h++] = r & 255), u === 1 && (r = P[n.charCodeAt(w)] << 10 | P[n.charCodeAt(w + 1)] << 4 | P[n.charCodeAt(w + 2)] >> 2, f[h++] = r >> 8 & 255, f[h++] = r & 255), f;
}
function ur(n) {
  return j[n >> 18 & 63] + j[n >> 12 & 63] + j[n >> 6 & 63] + j[n & 63];
}
function fr(n, r, o) {
  for (var s, u = [], f = r; f < o; f += 3)
    s = (n[f] << 16 & 16711680) + (n[f + 1] << 8 & 65280) + (n[f + 2] & 255), u.push(ur(s));
  return u.join("");
}
function hr(n) {
  for (var r, o = n.length, s = o % 3, u = [], f = 16383, h = 0, a = o - s; h < a; h += f)
    u.push(fr(n, h, h + f > a ? a : h + f));
  return s === 1 ? (r = n[o - 1], u.push(
    j[r >> 2] + j[r << 4 & 63] + "=="
  )) : s === 2 && (r = (n[o - 2] << 8) + n[o - 1], u.push(
    j[r >> 10] + j[r >> 4 & 63] + j[r << 2 & 63] + "="
  )), u.join("");
}
var xt = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
xt.read = function(n, r, o, s, u) {
  var f, h, a = u * 8 - s - 1, w = (1 << a) - 1, y = w >> 1, g = -7, m = o ? u - 1 : 0, b = o ? -1 : 1, B = n[r + m];
  for (m += b, f = B & (1 << -g) - 1, B >>= -g, g += a; g > 0; f = f * 256 + n[r + m], m += b, g -= 8)
    ;
  for (h = f & (1 << -g) - 1, f >>= -g, g += s; g > 0; h = h * 256 + n[r + m], m += b, g -= 8)
    ;
  if (f === 0)
    f = 1 - y;
  else {
    if (f === w)
      return h ? NaN : (B ? -1 : 1) * (1 / 0);
    h = h + Math.pow(2, s), f = f - y;
  }
  return (B ? -1 : 1) * h * Math.pow(2, f - s);
};
xt.write = function(n, r, o, s, u, f) {
  var h, a, w, y = f * 8 - u - 1, g = (1 << y) - 1, m = g >> 1, b = u === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, B = s ? 0 : f - 1, T = s ? 1 : -1, L = r < 0 || r === 0 && 1 / r < 0 ? 1 : 0;
  for (r = Math.abs(r), isNaN(r) || r === 1 / 0 ? (a = isNaN(r) ? 1 : 0, h = g) : (h = Math.floor(Math.log(r) / Math.LN2), r * (w = Math.pow(2, -h)) < 1 && (h--, w *= 2), h + m >= 1 ? r += b / w : r += b * Math.pow(2, 1 - m), r * w >= 2 && (h++, w /= 2), h + m >= g ? (a = 0, h = g) : h + m >= 1 ? (a = (r * w - 1) * Math.pow(2, u), h = h + m) : (a = r * Math.pow(2, m - 1) * Math.pow(2, u), h = 0)); u >= 8; n[o + B] = a & 255, B += T, a /= 256, u -= 8)
    ;
  for (h = h << u | a, y += u; y > 0; n[o + B] = h & 255, B += T, h /= 256, y -= 8)
    ;
  n[o + B - T] |= L * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(n) {
  const r = st, o = xt, s = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  n.Buffer = a, n.SlowBuffer = M, n.INSPECT_MAX_BYTES = 50;
  const u = 2147483647;
  n.kMaxLength = u, a.TYPED_ARRAY_SUPPORT = f(), !a.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function f() {
    try {
      const i = new Uint8Array(1), t = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(i, t), i.foo() === 42;
    } catch {
      return !1;
    }
  }
  Object.defineProperty(a.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (a.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(a.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (a.isBuffer(this))
        return this.byteOffset;
    }
  });
  function h(i) {
    if (i > u)
      throw new RangeError('The value "' + i + '" is invalid for option "size"');
    const t = new Uint8Array(i);
    return Object.setPrototypeOf(t, a.prototype), t;
  }
  function a(i, t, e) {
    if (typeof i == "number") {
      if (typeof t == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return m(i);
    }
    return w(i, t, e);
  }
  a.poolSize = 8192;
  function w(i, t, e) {
    if (typeof i == "string")
      return b(i, t);
    if (ArrayBuffer.isView(i))
      return T(i);
    if (i == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i
      );
    if (D(i, ArrayBuffer) || i && D(i.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (D(i, SharedArrayBuffer) || i && D(i.buffer, SharedArrayBuffer)))
      return L(i, t, e);
    if (typeof i == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    const c = i.valueOf && i.valueOf();
    if (c != null && c !== i)
      return a.from(c, t, e);
    const l = N(i);
    if (l)
      return l;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof i[Symbol.toPrimitive] == "function")
      return a.from(i[Symbol.toPrimitive]("string"), t, e);
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i
    );
  }
  a.from = function(i, t, e) {
    return w(i, t, e);
  }, Object.setPrototypeOf(a.prototype, Uint8Array.prototype), Object.setPrototypeOf(a, Uint8Array);
  function y(i) {
    if (typeof i != "number")
      throw new TypeError('"size" argument must be of type number');
    if (i < 0)
      throw new RangeError('The value "' + i + '" is invalid for option "size"');
  }
  function g(i, t, e) {
    return y(i), i <= 0 ? h(i) : t !== void 0 ? typeof e == "string" ? h(i).fill(t, e) : h(i).fill(t) : h(i);
  }
  a.alloc = function(i, t, e) {
    return g(i, t, e);
  };
  function m(i) {
    return y(i), h(i < 0 ? 0 : U(i) | 0);
  }
  a.allocUnsafe = function(i) {
    return m(i);
  }, a.allocUnsafeSlow = function(i) {
    return m(i);
  };
  function b(i, t) {
    if ((typeof t != "string" || t === "") && (t = "utf8"), !a.isEncoding(t))
      throw new TypeError("Unknown encoding: " + t);
    const e = $(i, t) | 0;
    let c = h(e);
    const l = c.write(i, t);
    return l !== e && (c = c.slice(0, l)), c;
  }
  function B(i) {
    const t = i.length < 0 ? 0 : U(i.length) | 0, e = h(t);
    for (let c = 0; c < t; c += 1)
      e[c] = i[c] & 255;
    return e;
  }
  function T(i) {
    if (D(i, Uint8Array)) {
      const t = new Uint8Array(i);
      return L(t.buffer, t.byteOffset, t.byteLength);
    }
    return B(i);
  }
  function L(i, t, e) {
    if (t < 0 || i.byteLength < t)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (i.byteLength < t + (e || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let c;
    return t === void 0 && e === void 0 ? c = new Uint8Array(i) : e === void 0 ? c = new Uint8Array(i, t) : c = new Uint8Array(i, t, e), Object.setPrototypeOf(c, a.prototype), c;
  }
  function N(i) {
    if (a.isBuffer(i)) {
      const t = U(i.length) | 0, e = h(t);
      return e.length === 0 || i.copy(e, 0, 0, t), e;
    }
    if (i.length !== void 0)
      return typeof i.length != "number" || ht(i.length) ? h(0) : B(i);
    if (i.type === "Buffer" && Array.isArray(i.data))
      return B(i.data);
  }
  function U(i) {
    if (i >= u)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + u.toString(16) + " bytes");
    return i | 0;
  }
  function M(i) {
    return +i != i && (i = 0), a.alloc(+i);
  }
  a.isBuffer = function(t) {
    return t != null && t._isBuffer === !0 && t !== a.prototype;
  }, a.compare = function(t, e) {
    if (D(t, Uint8Array) && (t = a.from(t, t.offset, t.byteLength)), D(e, Uint8Array) && (e = a.from(e, e.offset, e.byteLength)), !a.isBuffer(t) || !a.isBuffer(e))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (t === e)
      return 0;
    let c = t.length, l = e.length;
    for (let p = 0, d = Math.min(c, l); p < d; ++p)
      if (t[p] !== e[p]) {
        c = t[p], l = e[p];
        break;
      }
    return c < l ? -1 : l < c ? 1 : 0;
  }, a.isEncoding = function(t) {
    switch (String(t).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  }, a.concat = function(t, e) {
    if (!Array.isArray(t))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (t.length === 0)
      return a.alloc(0);
    let c;
    if (e === void 0)
      for (e = 0, c = 0; c < t.length; ++c)
        e += t[c].length;
    const l = a.allocUnsafe(e);
    let p = 0;
    for (c = 0; c < t.length; ++c) {
      let d = t[c];
      if (D(d, Uint8Array))
        p + d.length > l.length ? (a.isBuffer(d) || (d = a.from(d)), d.copy(l, p)) : Uint8Array.prototype.set.call(
          l,
          d,
          p
        );
      else if (a.isBuffer(d))
        d.copy(l, p);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      p += d.length;
    }
    return l;
  };
  function $(i, t) {
    if (a.isBuffer(i))
      return i.length;
    if (ArrayBuffer.isView(i) || D(i, ArrayBuffer))
      return i.byteLength;
    if (typeof i != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof i
      );
    const e = i.length, c = arguments.length > 2 && arguments[2] === !0;
    if (!c && e === 0)
      return 0;
    let l = !1;
    for (; ; )
      switch (t) {
        case "ascii":
        case "latin1":
        case "binary":
          return e;
        case "utf8":
        case "utf-8":
          return ft(i).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return e * 2;
        case "hex":
          return e >>> 1;
        case "base64":
          return Rt(i).length;
        default:
          if (l)
            return c ? -1 : ft(i).length;
          t = ("" + t).toLowerCase(), l = !0;
      }
  }
  a.byteLength = $;
  function v(i, t, e) {
    let c = !1;
    if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((e === void 0 || e > this.length) && (e = this.length), e <= 0) || (e >>>= 0, t >>>= 0, e <= t))
      return "";
    for (i || (i = "utf8"); ; )
      switch (i) {
        case "hex":
          return pe(this, t, e);
        case "utf8":
        case "utf-8":
          return It(this, t, e);
        case "ascii":
          return he(this, t, e);
        case "latin1":
        case "binary":
          return le(this, t, e);
        case "base64":
          return ue(this, t, e);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return de(this, t, e);
        default:
          if (c)
            throw new TypeError("Unknown encoding: " + i);
          i = (i + "").toLowerCase(), c = !0;
      }
  }
  a.prototype._isBuffer = !0;
  function R(i, t, e) {
    const c = i[t];
    i[t] = i[e], i[e] = c;
  }
  a.prototype.swap16 = function() {
    const t = this.length;
    if (t % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let e = 0; e < t; e += 2)
      R(this, e, e + 1);
    return this;
  }, a.prototype.swap32 = function() {
    const t = this.length;
    if (t % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let e = 0; e < t; e += 4)
      R(this, e, e + 3), R(this, e + 1, e + 2);
    return this;
  }, a.prototype.swap64 = function() {
    const t = this.length;
    if (t % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let e = 0; e < t; e += 8)
      R(this, e, e + 7), R(this, e + 1, e + 6), R(this, e + 2, e + 5), R(this, e + 3, e + 4);
    return this;
  }, a.prototype.toString = function() {
    const t = this.length;
    return t === 0 ? "" : arguments.length === 0 ? It(this, 0, t) : v.apply(this, arguments);
  }, a.prototype.toLocaleString = a.prototype.toString, a.prototype.equals = function(t) {
    if (!a.isBuffer(t))
      throw new TypeError("Argument must be a Buffer");
    return this === t ? !0 : a.compare(this, t) === 0;
  }, a.prototype.inspect = function() {
    let t = "";
    const e = n.INSPECT_MAX_BYTES;
    return t = this.toString("hex", 0, e).replace(/(.{2})/g, "$1 ").trim(), this.length > e && (t += " ... "), "<Buffer " + t + ">";
  }, s && (a.prototype[s] = a.prototype.inspect), a.prototype.compare = function(t, e, c, l, p) {
    if (D(t, Uint8Array) && (t = a.from(t, t.offset, t.byteLength)), !a.isBuffer(t))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof t
      );
    if (e === void 0 && (e = 0), c === void 0 && (c = t ? t.length : 0), l === void 0 && (l = 0), p === void 0 && (p = this.length), e < 0 || c > t.length || l < 0 || p > this.length)
      throw new RangeError("out of range index");
    if (l >= p && e >= c)
      return 0;
    if (l >= p)
      return -1;
    if (e >= c)
      return 1;
    if (e >>>= 0, c >>>= 0, l >>>= 0, p >>>= 0, this === t)
      return 0;
    let d = p - l, x = c - e;
    const A = Math.min(d, x), I = this.slice(l, p), F = t.slice(e, c);
    for (let E = 0; E < A; ++E)
      if (I[E] !== F[E]) {
        d = I[E], x = F[E];
        break;
      }
    return d < x ? -1 : x < d ? 1 : 0;
  };
  function Bt(i, t, e, c, l) {
    if (i.length === 0)
      return -1;
    if (typeof e == "string" ? (c = e, e = 0) : e > 2147483647 ? e = 2147483647 : e < -2147483648 && (e = -2147483648), e = +e, ht(e) && (e = l ? 0 : i.length - 1), e < 0 && (e = i.length + e), e >= i.length) {
      if (l)
        return -1;
      e = i.length - 1;
    } else if (e < 0)
      if (l)
        e = 0;
      else
        return -1;
    if (typeof t == "string" && (t = a.from(t, c)), a.isBuffer(t))
      return t.length === 0 ? -1 : Et(i, t, e, c, l);
    if (typeof t == "number")
      return t = t & 255, typeof Uint8Array.prototype.indexOf == "function" ? l ? Uint8Array.prototype.indexOf.call(i, t, e) : Uint8Array.prototype.lastIndexOf.call(i, t, e) : Et(i, [t], e, c, l);
    throw new TypeError("val must be string, number or Buffer");
  }
  function Et(i, t, e, c, l) {
    let p = 1, d = i.length, x = t.length;
    if (c !== void 0 && (c = String(c).toLowerCase(), c === "ucs2" || c === "ucs-2" || c === "utf16le" || c === "utf-16le")) {
      if (i.length < 2 || t.length < 2)
        return -1;
      p = 2, d /= 2, x /= 2, e /= 2;
    }
    function A(F, E) {
      return p === 1 ? F[E] : F.readUInt16BE(E * p);
    }
    let I;
    if (l) {
      let F = -1;
      for (I = e; I < d; I++)
        if (A(i, I) === A(t, F === -1 ? 0 : I - F)) {
          if (F === -1 && (F = I), I - F + 1 === x)
            return F * p;
        } else
          F !== -1 && (I -= I - F), F = -1;
    } else
      for (e + x > d && (e = d - x), I = e; I >= 0; I--) {
        let F = !0;
        for (let E = 0; E < x; E++)
          if (A(i, I + E) !== A(t, E)) {
            F = !1;
            break;
          }
        if (F)
          return I;
      }
    return -1;
  }
  a.prototype.includes = function(t, e, c) {
    return this.indexOf(t, e, c) !== -1;
  }, a.prototype.indexOf = function(t, e, c) {
    return Bt(this, t, e, c, !0);
  }, a.prototype.lastIndexOf = function(t, e, c) {
    return Bt(this, t, e, c, !1);
  };
  function ie(i, t, e, c) {
    e = Number(e) || 0;
    const l = i.length - e;
    c ? (c = Number(c), c > l && (c = l)) : c = l;
    const p = t.length;
    c > p / 2 && (c = p / 2);
    let d;
    for (d = 0; d < c; ++d) {
      const x = parseInt(t.substr(d * 2, 2), 16);
      if (ht(x))
        return d;
      i[e + d] = x;
    }
    return d;
  }
  function oe(i, t, e, c) {
    return nt(ft(t, i.length - e), i, e, c);
  }
  function se(i, t, e, c) {
    return nt(me(t), i, e, c);
  }
  function ae(i, t, e, c) {
    return nt(Rt(t), i, e, c);
  }
  function ce(i, t, e, c) {
    return nt(be(t, i.length - e), i, e, c);
  }
  a.prototype.write = function(t, e, c, l) {
    if (e === void 0)
      l = "utf8", c = this.length, e = 0;
    else if (c === void 0 && typeof e == "string")
      l = e, c = this.length, e = 0;
    else if (isFinite(e))
      e = e >>> 0, isFinite(c) ? (c = c >>> 0, l === void 0 && (l = "utf8")) : (l = c, c = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    const p = this.length - e;
    if ((c === void 0 || c > p) && (c = p), t.length > 0 && (c < 0 || e < 0) || e > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    l || (l = "utf8");
    let d = !1;
    for (; ; )
      switch (l) {
        case "hex":
          return ie(this, t, e, c);
        case "utf8":
        case "utf-8":
          return oe(this, t, e, c);
        case "ascii":
        case "latin1":
        case "binary":
          return se(this, t, e, c);
        case "base64":
          return ae(this, t, e, c);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ce(this, t, e, c);
        default:
          if (d)
            throw new TypeError("Unknown encoding: " + l);
          l = ("" + l).toLowerCase(), d = !0;
      }
  }, a.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function ue(i, t, e) {
    return t === 0 && e === i.length ? r.fromByteArray(i) : r.fromByteArray(i.slice(t, e));
  }
  function It(i, t, e) {
    e = Math.min(i.length, e);
    const c = [];
    let l = t;
    for (; l < e; ) {
      const p = i[l];
      let d = null, x = p > 239 ? 4 : p > 223 ? 3 : p > 191 ? 2 : 1;
      if (l + x <= e) {
        let A, I, F, E;
        switch (x) {
          case 1:
            p < 128 && (d = p);
            break;
          case 2:
            A = i[l + 1], (A & 192) === 128 && (E = (p & 31) << 6 | A & 63, E > 127 && (d = E));
            break;
          case 3:
            A = i[l + 1], I = i[l + 2], (A & 192) === 128 && (I & 192) === 128 && (E = (p & 15) << 12 | (A & 63) << 6 | I & 63, E > 2047 && (E < 55296 || E > 57343) && (d = E));
            break;
          case 4:
            A = i[l + 1], I = i[l + 2], F = i[l + 3], (A & 192) === 128 && (I & 192) === 128 && (F & 192) === 128 && (E = (p & 15) << 18 | (A & 63) << 12 | (I & 63) << 6 | F & 63, E > 65535 && E < 1114112 && (d = E));
        }
      }
      d === null ? (d = 65533, x = 1) : d > 65535 && (d -= 65536, c.push(d >>> 10 & 1023 | 55296), d = 56320 | d & 1023), c.push(d), l += x;
    }
    return fe(c);
  }
  const _t = 4096;
  function fe(i) {
    const t = i.length;
    if (t <= _t)
      return String.fromCharCode.apply(String, i);
    let e = "", c = 0;
    for (; c < t; )
      e += String.fromCharCode.apply(
        String,
        i.slice(c, c += _t)
      );
    return e;
  }
  function he(i, t, e) {
    let c = "";
    e = Math.min(i.length, e);
    for (let l = t; l < e; ++l)
      c += String.fromCharCode(i[l] & 127);
    return c;
  }
  function le(i, t, e) {
    let c = "";
    e = Math.min(i.length, e);
    for (let l = t; l < e; ++l)
      c += String.fromCharCode(i[l]);
    return c;
  }
  function pe(i, t, e) {
    const c = i.length;
    (!t || t < 0) && (t = 0), (!e || e < 0 || e > c) && (e = c);
    let l = "";
    for (let p = t; p < e; ++p)
      l += xe[i[p]];
    return l;
  }
  function de(i, t, e) {
    const c = i.slice(t, e);
    let l = "";
    for (let p = 0; p < c.length - 1; p += 2)
      l += String.fromCharCode(c[p] + c[p + 1] * 256);
    return l;
  }
  a.prototype.slice = function(t, e) {
    const c = this.length;
    t = ~~t, e = e === void 0 ? c : ~~e, t < 0 ? (t += c, t < 0 && (t = 0)) : t > c && (t = c), e < 0 ? (e += c, e < 0 && (e = 0)) : e > c && (e = c), e < t && (e = t);
    const l = this.subarray(t, e);
    return Object.setPrototypeOf(l, a.prototype), l;
  };
  function S(i, t, e) {
    if (i % 1 !== 0 || i < 0)
      throw new RangeError("offset is not uint");
    if (i + t > e)
      throw new RangeError("Trying to access beyond buffer length");
  }
  a.prototype.readUintLE = a.prototype.readUIntLE = function(t, e, c) {
    t = t >>> 0, e = e >>> 0, c || S(t, e, this.length);
    let l = this[t], p = 1, d = 0;
    for (; ++d < e && (p *= 256); )
      l += this[t + d] * p;
    return l;
  }, a.prototype.readUintBE = a.prototype.readUIntBE = function(t, e, c) {
    t = t >>> 0, e = e >>> 0, c || S(t, e, this.length);
    let l = this[t + --e], p = 1;
    for (; e > 0 && (p *= 256); )
      l += this[t + --e] * p;
    return l;
  }, a.prototype.readUint8 = a.prototype.readUInt8 = function(t, e) {
    return t = t >>> 0, e || S(t, 1, this.length), this[t];
  }, a.prototype.readUint16LE = a.prototype.readUInt16LE = function(t, e) {
    return t = t >>> 0, e || S(t, 2, this.length), this[t] | this[t + 1] << 8;
  }, a.prototype.readUint16BE = a.prototype.readUInt16BE = function(t, e) {
    return t = t >>> 0, e || S(t, 2, this.length), this[t] << 8 | this[t + 1];
  }, a.prototype.readUint32LE = a.prototype.readUInt32LE = function(t, e) {
    return t = t >>> 0, e || S(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + this[t + 3] * 16777216;
  }, a.prototype.readUint32BE = a.prototype.readUInt32BE = function(t, e) {
    return t = t >>> 0, e || S(t, 4, this.length), this[t] * 16777216 + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
  }, a.prototype.readBigUInt64LE = q(function(t) {
    t = t >>> 0, V(t, "offset");
    const e = this[t], c = this[t + 7];
    (e === void 0 || c === void 0) && X(t, this.length - 8);
    const l = e + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24, p = this[++t] + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + c * 2 ** 24;
    return BigInt(l) + (BigInt(p) << BigInt(32));
  }), a.prototype.readBigUInt64BE = q(function(t) {
    t = t >>> 0, V(t, "offset");
    const e = this[t], c = this[t + 7];
    (e === void 0 || c === void 0) && X(t, this.length - 8);
    const l = e * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t], p = this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + c;
    return (BigInt(l) << BigInt(32)) + BigInt(p);
  }), a.prototype.readIntLE = function(t, e, c) {
    t = t >>> 0, e = e >>> 0, c || S(t, e, this.length);
    let l = this[t], p = 1, d = 0;
    for (; ++d < e && (p *= 256); )
      l += this[t + d] * p;
    return p *= 128, l >= p && (l -= Math.pow(2, 8 * e)), l;
  }, a.prototype.readIntBE = function(t, e, c) {
    t = t >>> 0, e = e >>> 0, c || S(t, e, this.length);
    let l = e, p = 1, d = this[t + --l];
    for (; l > 0 && (p *= 256); )
      d += this[t + --l] * p;
    return p *= 128, d >= p && (d -= Math.pow(2, 8 * e)), d;
  }, a.prototype.readInt8 = function(t, e) {
    return t = t >>> 0, e || S(t, 1, this.length), this[t] & 128 ? (255 - this[t] + 1) * -1 : this[t];
  }, a.prototype.readInt16LE = function(t, e) {
    t = t >>> 0, e || S(t, 2, this.length);
    const c = this[t] | this[t + 1] << 8;
    return c & 32768 ? c | 4294901760 : c;
  }, a.prototype.readInt16BE = function(t, e) {
    t = t >>> 0, e || S(t, 2, this.length);
    const c = this[t + 1] | this[t] << 8;
    return c & 32768 ? c | 4294901760 : c;
  }, a.prototype.readInt32LE = function(t, e) {
    return t = t >>> 0, e || S(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
  }, a.prototype.readInt32BE = function(t, e) {
    return t = t >>> 0, e || S(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
  }, a.prototype.readBigInt64LE = q(function(t) {
    t = t >>> 0, V(t, "offset");
    const e = this[t], c = this[t + 7];
    (e === void 0 || c === void 0) && X(t, this.length - 8);
    const l = this[t + 4] + this[t + 5] * 2 ** 8 + this[t + 6] * 2 ** 16 + (c << 24);
    return (BigInt(l) << BigInt(32)) + BigInt(e + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24);
  }), a.prototype.readBigInt64BE = q(function(t) {
    t = t >>> 0, V(t, "offset");
    const e = this[t], c = this[t + 7];
    (e === void 0 || c === void 0) && X(t, this.length - 8);
    const l = (e << 24) + // Overflow
    this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t];
    return (BigInt(l) << BigInt(32)) + BigInt(this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + c);
  }), a.prototype.readFloatLE = function(t, e) {
    return t = t >>> 0, e || S(t, 4, this.length), o.read(this, t, !0, 23, 4);
  }, a.prototype.readFloatBE = function(t, e) {
    return t = t >>> 0, e || S(t, 4, this.length), o.read(this, t, !1, 23, 4);
  }, a.prototype.readDoubleLE = function(t, e) {
    return t = t >>> 0, e || S(t, 8, this.length), o.read(this, t, !0, 52, 8);
  }, a.prototype.readDoubleBE = function(t, e) {
    return t = t >>> 0, e || S(t, 8, this.length), o.read(this, t, !1, 52, 8);
  };
  function C(i, t, e, c, l, p) {
    if (!a.isBuffer(i))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (t > l || t < p)
      throw new RangeError('"value" argument is out of bounds');
    if (e + c > i.length)
      throw new RangeError("Index out of range");
  }
  a.prototype.writeUintLE = a.prototype.writeUIntLE = function(t, e, c, l) {
    if (t = +t, e = e >>> 0, c = c >>> 0, !l) {
      const x = Math.pow(2, 8 * c) - 1;
      C(this, t, e, c, x, 0);
    }
    let p = 1, d = 0;
    for (this[e] = t & 255; ++d < c && (p *= 256); )
      this[e + d] = t / p & 255;
    return e + c;
  }, a.prototype.writeUintBE = a.prototype.writeUIntBE = function(t, e, c, l) {
    if (t = +t, e = e >>> 0, c = c >>> 0, !l) {
      const x = Math.pow(2, 8 * c) - 1;
      C(this, t, e, c, x, 0);
    }
    let p = c - 1, d = 1;
    for (this[e + p] = t & 255; --p >= 0 && (d *= 256); )
      this[e + p] = t / d & 255;
    return e + c;
  }, a.prototype.writeUint8 = a.prototype.writeUInt8 = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 1, 255, 0), this[e] = t & 255, e + 1;
  }, a.prototype.writeUint16LE = a.prototype.writeUInt16LE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 2, 65535, 0), this[e] = t & 255, this[e + 1] = t >>> 8, e + 2;
  }, a.prototype.writeUint16BE = a.prototype.writeUInt16BE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 2, 65535, 0), this[e] = t >>> 8, this[e + 1] = t & 255, e + 2;
  }, a.prototype.writeUint32LE = a.prototype.writeUInt32LE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 4, 4294967295, 0), this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = t & 255, e + 4;
  }, a.prototype.writeUint32BE = a.prototype.writeUInt32BE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 4, 4294967295, 0), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t & 255, e + 4;
  };
  function At(i, t, e, c, l) {
    $t(t, c, l, i, e, 7);
    let p = Number(t & BigInt(4294967295));
    i[e++] = p, p = p >> 8, i[e++] = p, p = p >> 8, i[e++] = p, p = p >> 8, i[e++] = p;
    let d = Number(t >> BigInt(32) & BigInt(4294967295));
    return i[e++] = d, d = d >> 8, i[e++] = d, d = d >> 8, i[e++] = d, d = d >> 8, i[e++] = d, e;
  }
  function Ft(i, t, e, c, l) {
    $t(t, c, l, i, e, 7);
    let p = Number(t & BigInt(4294967295));
    i[e + 7] = p, p = p >> 8, i[e + 6] = p, p = p >> 8, i[e + 5] = p, p = p >> 8, i[e + 4] = p;
    let d = Number(t >> BigInt(32) & BigInt(4294967295));
    return i[e + 3] = d, d = d >> 8, i[e + 2] = d, d = d >> 8, i[e + 1] = d, d = d >> 8, i[e] = d, e + 8;
  }
  a.prototype.writeBigUInt64LE = q(function(t, e = 0) {
    return At(this, t, e, BigInt(0), BigInt("0xffffffffffffffff"));
  }), a.prototype.writeBigUInt64BE = q(function(t, e = 0) {
    return Ft(this, t, e, BigInt(0), BigInt("0xffffffffffffffff"));
  }), a.prototype.writeIntLE = function(t, e, c, l) {
    if (t = +t, e = e >>> 0, !l) {
      const A = Math.pow(2, 8 * c - 1);
      C(this, t, e, c, A - 1, -A);
    }
    let p = 0, d = 1, x = 0;
    for (this[e] = t & 255; ++p < c && (d *= 256); )
      t < 0 && x === 0 && this[e + p - 1] !== 0 && (x = 1), this[e + p] = (t / d >> 0) - x & 255;
    return e + c;
  }, a.prototype.writeIntBE = function(t, e, c, l) {
    if (t = +t, e = e >>> 0, !l) {
      const A = Math.pow(2, 8 * c - 1);
      C(this, t, e, c, A - 1, -A);
    }
    let p = c - 1, d = 1, x = 0;
    for (this[e + p] = t & 255; --p >= 0 && (d *= 256); )
      t < 0 && x === 0 && this[e + p + 1] !== 0 && (x = 1), this[e + p] = (t / d >> 0) - x & 255;
    return e + c;
  }, a.prototype.writeInt8 = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 1, 127, -128), t < 0 && (t = 255 + t + 1), this[e] = t & 255, e + 1;
  }, a.prototype.writeInt16LE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 2, 32767, -32768), this[e] = t & 255, this[e + 1] = t >>> 8, e + 2;
  }, a.prototype.writeInt16BE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 2, 32767, -32768), this[e] = t >>> 8, this[e + 1] = t & 255, e + 2;
  }, a.prototype.writeInt32LE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 4, 2147483647, -2147483648), this[e] = t & 255, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24, e + 4;
  }, a.prototype.writeInt32BE = function(t, e, c) {
    return t = +t, e = e >>> 0, c || C(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t & 255, e + 4;
  }, a.prototype.writeBigInt64LE = q(function(t, e = 0) {
    return At(this, t, e, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }), a.prototype.writeBigInt64BE = q(function(t, e = 0) {
    return Ft(this, t, e, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function Ut(i, t, e, c, l, p) {
    if (e + c > i.length)
      throw new RangeError("Index out of range");
    if (e < 0)
      throw new RangeError("Index out of range");
  }
  function St(i, t, e, c, l) {
    return t = +t, e = e >>> 0, l || Ut(i, t, e, 4), o.write(i, t, e, c, 23, 4), e + 4;
  }
  a.prototype.writeFloatLE = function(t, e, c) {
    return St(this, t, e, !0, c);
  }, a.prototype.writeFloatBE = function(t, e, c) {
    return St(this, t, e, !1, c);
  };
  function kt(i, t, e, c, l) {
    return t = +t, e = e >>> 0, l || Ut(i, t, e, 8), o.write(i, t, e, c, 52, 8), e + 8;
  }
  a.prototype.writeDoubleLE = function(t, e, c) {
    return kt(this, t, e, !0, c);
  }, a.prototype.writeDoubleBE = function(t, e, c) {
    return kt(this, t, e, !1, c);
  }, a.prototype.copy = function(t, e, c, l) {
    if (!a.isBuffer(t))
      throw new TypeError("argument should be a Buffer");
    if (c || (c = 0), !l && l !== 0 && (l = this.length), e >= t.length && (e = t.length), e || (e = 0), l > 0 && l < c && (l = c), l === c || t.length === 0 || this.length === 0)
      return 0;
    if (e < 0)
      throw new RangeError("targetStart out of bounds");
    if (c < 0 || c >= this.length)
      throw new RangeError("Index out of range");
    if (l < 0)
      throw new RangeError("sourceEnd out of bounds");
    l > this.length && (l = this.length), t.length - e < l - c && (l = t.length - e + c);
    const p = l - c;
    return this === t && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(e, c, l) : Uint8Array.prototype.set.call(
      t,
      this.subarray(c, l),
      e
    ), p;
  }, a.prototype.fill = function(t, e, c, l) {
    if (typeof t == "string") {
      if (typeof e == "string" ? (l = e, e = 0, c = this.length) : typeof c == "string" && (l = c, c = this.length), l !== void 0 && typeof l != "string")
        throw new TypeError("encoding must be a string");
      if (typeof l == "string" && !a.isEncoding(l))
        throw new TypeError("Unknown encoding: " + l);
      if (t.length === 1) {
        const d = t.charCodeAt(0);
        (l === "utf8" && d < 128 || l === "latin1") && (t = d);
      }
    } else
      typeof t == "number" ? t = t & 255 : typeof t == "boolean" && (t = Number(t));
    if (e < 0 || this.length < e || this.length < c)
      throw new RangeError("Out of range index");
    if (c <= e)
      return this;
    e = e >>> 0, c = c === void 0 ? this.length : c >>> 0, t || (t = 0);
    let p;
    if (typeof t == "number")
      for (p = e; p < c; ++p)
        this[p] = t;
    else {
      const d = a.isBuffer(t) ? t : a.from(t, l), x = d.length;
      if (x === 0)
        throw new TypeError('The value "' + t + '" is invalid for argument "value"');
      for (p = 0; p < c - e; ++p)
        this[p + e] = d[p % x];
    }
    return this;
  };
  const Y = {};
  function ut(i, t, e) {
    Y[i] = class extends e {
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: t.apply(this, arguments),
          writable: !0,
          configurable: !0
        }), this.name = `${this.name} [${i}]`, this.stack, delete this.name;
      }
      get code() {
        return i;
      }
      set code(l) {
        Object.defineProperty(this, "code", {
          configurable: !0,
          enumerable: !0,
          value: l,
          writable: !0
        });
      }
      toString() {
        return `${this.name} [${i}]: ${this.message}`;
      }
    };
  }
  ut(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(i) {
      return i ? `${i} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    },
    RangeError
  ), ut(
    "ERR_INVALID_ARG_TYPE",
    function(i, t) {
      return `The "${i}" argument must be of type number. Received type ${typeof t}`;
    },
    TypeError
  ), ut(
    "ERR_OUT_OF_RANGE",
    function(i, t, e) {
      let c = `The value of "${i}" is out of range.`, l = e;
      return Number.isInteger(e) && Math.abs(e) > 2 ** 32 ? l = Tt(String(e)) : typeof e == "bigint" && (l = String(e), (e > BigInt(2) ** BigInt(32) || e < -(BigInt(2) ** BigInt(32))) && (l = Tt(l)), l += "n"), c += ` It must be ${t}. Received ${l}`, c;
    },
    RangeError
  );
  function Tt(i) {
    let t = "", e = i.length;
    const c = i[0] === "-" ? 1 : 0;
    for (; e >= c + 4; e -= 3)
      t = `_${i.slice(e - 3, e)}${t}`;
    return `${i.slice(0, e)}${t}`;
  }
  function we(i, t, e) {
    V(t, "offset"), (i[t] === void 0 || i[t + e] === void 0) && X(t, i.length - (e + 1));
  }
  function $t(i, t, e, c, l, p) {
    if (i > e || i < t) {
      const d = typeof t == "bigint" ? "n" : "";
      let x;
      throw p > 3 ? t === 0 || t === BigInt(0) ? x = `>= 0${d} and < 2${d} ** ${(p + 1) * 8}${d}` : x = `>= -(2${d} ** ${(p + 1) * 8 - 1}${d}) and < 2 ** ${(p + 1) * 8 - 1}${d}` : x = `>= ${t}${d} and <= ${e}${d}`, new Y.ERR_OUT_OF_RANGE("value", x, i);
    }
    we(c, l, p);
  }
  function V(i, t) {
    if (typeof i != "number")
      throw new Y.ERR_INVALID_ARG_TYPE(t, "number", i);
  }
  function X(i, t, e) {
    throw Math.floor(i) !== i ? (V(i, e), new Y.ERR_OUT_OF_RANGE(e || "offset", "an integer", i)) : t < 0 ? new Y.ERR_BUFFER_OUT_OF_BOUNDS() : new Y.ERR_OUT_OF_RANGE(
      e || "offset",
      `>= ${e ? 1 : 0} and <= ${t}`,
      i
    );
  }
  const ye = /[^+/0-9A-Za-z-_]/g;
  function ge(i) {
    if (i = i.split("=")[0], i = i.trim().replace(ye, ""), i.length < 2)
      return "";
    for (; i.length % 4 !== 0; )
      i = i + "=";
    return i;
  }
  function ft(i, t) {
    t = t || 1 / 0;
    let e;
    const c = i.length;
    let l = null;
    const p = [];
    for (let d = 0; d < c; ++d) {
      if (e = i.charCodeAt(d), e > 55295 && e < 57344) {
        if (!l) {
          if (e > 56319) {
            (t -= 3) > -1 && p.push(239, 191, 189);
            continue;
          } else if (d + 1 === c) {
            (t -= 3) > -1 && p.push(239, 191, 189);
            continue;
          }
          l = e;
          continue;
        }
        if (e < 56320) {
          (t -= 3) > -1 && p.push(239, 191, 189), l = e;
          continue;
        }
        e = (l - 55296 << 10 | e - 56320) + 65536;
      } else
        l && (t -= 3) > -1 && p.push(239, 191, 189);
      if (l = null, e < 128) {
        if ((t -= 1) < 0)
          break;
        p.push(e);
      } else if (e < 2048) {
        if ((t -= 2) < 0)
          break;
        p.push(
          e >> 6 | 192,
          e & 63 | 128
        );
      } else if (e < 65536) {
        if ((t -= 3) < 0)
          break;
        p.push(
          e >> 12 | 224,
          e >> 6 & 63 | 128,
          e & 63 | 128
        );
      } else if (e < 1114112) {
        if ((t -= 4) < 0)
          break;
        p.push(
          e >> 18 | 240,
          e >> 12 & 63 | 128,
          e >> 6 & 63 | 128,
          e & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return p;
  }
  function me(i) {
    const t = [];
    for (let e = 0; e < i.length; ++e)
      t.push(i.charCodeAt(e) & 255);
    return t;
  }
  function be(i, t) {
    let e, c, l;
    const p = [];
    for (let d = 0; d < i.length && !((t -= 2) < 0); ++d)
      e = i.charCodeAt(d), c = e >> 8, l = e % 256, p.push(l), p.push(c);
    return p;
  }
  function Rt(i) {
    return r.toByteArray(ge(i));
  }
  function nt(i, t, e, c) {
    let l;
    for (l = 0; l < c && !(l + e >= t.length || l >= i.length); ++l)
      t[l + e] = i[l];
    return l;
  }
  function D(i, t) {
    return i instanceof t || i != null && i.constructor != null && i.constructor.name != null && i.constructor.name === t.name;
  }
  function ht(i) {
    return i !== i;
  }
  const xe = function() {
    const i = "0123456789abcdef", t = new Array(256);
    for (let e = 0; e < 16; ++e) {
      const c = e * 16;
      for (let l = 0; l < 16; ++l)
        t[c + l] = i[e] + i[l];
    }
    return t;
  }();
  function q(i) {
    return typeof BigInt > "u" ? Be : i;
  }
  function Be() {
    throw new Error("BigInt not supported");
  }
})(H);
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
(function(n, r) {
  var o = H, s = o.Buffer;
  function u(h, a) {
    for (var w in h)
      a[w] = h[w];
  }
  s.from && s.alloc && s.allocUnsafe && s.allocUnsafeSlow ? n.exports = o : (u(o, r), r.Buffer = f);
  function f(h, a, w) {
    return s(h, a, w);
  }
  f.prototype = Object.create(s.prototype), u(s, f), f.from = function(h, a, w) {
    if (typeof h == "number")
      throw new TypeError("Argument must not be a number");
    return s(h, a, w);
  }, f.alloc = function(h, a, w) {
    if (typeof h != "number")
      throw new TypeError("Argument must be a number");
    var y = s(h);
    return a !== void 0 ? typeof w == "string" ? y.fill(a, w) : y.fill(a) : y.fill(0), y;
  }, f.allocUnsafe = function(h) {
    if (typeof h != "number")
      throw new TypeError("Argument must be a number");
    return s(h);
  }, f.allocUnsafeSlow = function(h) {
    if (typeof h != "number")
      throw new TypeError("Argument must be a number");
    return o.SlowBuffer(h);
  };
})(mt, mt.exports);
var Vt = mt.exports, Kt = Vt.Buffer;
function at(n, r) {
  this._block = Kt.alloc(n), this._finalSize = r, this._blockSize = n, this._len = 0;
}
at.prototype.update = function(n, r) {
  typeof n == "string" && (r = r || "utf8", n = Kt.from(n, r));
  for (var o = this._block, s = this._blockSize, u = n.length, f = this._len, h = 0; h < u; ) {
    for (var a = f % s, w = Math.min(u - h, s - a), y = 0; y < w; y++)
      o[a + y] = n[h + y];
    f += w, h += w, f % s === 0 && this._update(o);
  }
  return this._len += u, this;
};
at.prototype.digest = function(n) {
  var r = this._len % this._blockSize;
  this._block[r] = 128, this._block.fill(0, r + 1), r >= this._finalSize && (this._update(this._block), this._block.fill(0));
  var o = this._len * 8;
  if (o <= 4294967295)
    this._block.writeUInt32BE(o, this._blockSize - 4);
  else {
    var s = (o & 4294967295) >>> 0, u = (o - s) / 4294967296;
    this._block.writeUInt32BE(u, this._blockSize - 8), this._block.writeUInt32BE(s, this._blockSize - 4);
  }
  this._update(this._block);
  var f = this._hash();
  return n ? f.toString(n) : f;
};
at.prototype._update = function() {
  throw new Error("_update must be implemented by subclass");
};
var lr = at, pr = nr, Jt = lr, dr = Vt.Buffer, wr = [
  1518500249,
  1859775393,
  -1894007588,
  -899497514
], yr = new Array(80);
function rt() {
  this.init(), this._w = yr, Jt.call(this, 64, 56);
}
pr(rt, Jt);
rt.prototype.init = function() {
  return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this;
};
function gr(n) {
  return n << 1 | n >>> 31;
}
function mr(n) {
  return n << 5 | n >>> 27;
}
function br(n) {
  return n << 30 | n >>> 2;
}
function xr(n, r, o, s) {
  return n === 0 ? r & o | ~r & s : n === 2 ? r & o | r & s | o & s : r ^ o ^ s;
}
rt.prototype._update = function(n) {
  for (var r = this._w, o = this._a | 0, s = this._b | 0, u = this._c | 0, f = this._d | 0, h = this._e | 0, a = 0; a < 16; ++a)
    r[a] = n.readInt32BE(a * 4);
  for (; a < 80; ++a)
    r[a] = gr(r[a - 3] ^ r[a - 8] ^ r[a - 14] ^ r[a - 16]);
  for (var w = 0; w < 80; ++w) {
    var y = ~~(w / 20), g = mr(o) + xr(y, s, u, f) + h + r[w] + wr[y] | 0;
    h = f, f = u, u = br(s), s = o, o = g;
  }
  this._a = o + this._a | 0, this._b = s + this._b | 0, this._c = u + this._c | 0, this._d = f + this._d | 0, this._e = h + this._e | 0;
};
rt.prototype._hash = function() {
  var n = dr.allocUnsafe(20);
  return n.writeInt32BE(this._a | 0, 0), n.writeInt32BE(this._b | 0, 4), n.writeInt32BE(this._c | 0, 8), n.writeInt32BE(this._d | 0, 12), n.writeInt32BE(this._e | 0, 16), n;
};
var Br = rt;
const Er = /* @__PURE__ */ rr(Br);
function Ir(n) {
  let r = "";
  for (const o of new Uint8Array(n))
    o < 16 && (r += "0"), r += o.toString(16);
  return r;
}
let dt = null;
async function jt(n) {
  return dt === null && (dt = await Ar()), dt ? Xt(n) : _r(n);
}
function _r(n) {
  return new Er().update(n).digest("hex");
}
async function Xt(n) {
  const r = await crypto.subtle.digest("SHA-1", n);
  return Ir(r);
}
async function Ar() {
  try {
    if (await Xt(new Uint8Array([])) === "da39a3ee5e6b4b0d3255bfef95601890afd80709")
      return !0;
  } catch {
  }
  return !1;
}
function Fr(n) {
  const r = [];
  let o = 0, s = 0;
  do {
    o = n.readUInt8();
    const u = o & 127;
    r.push(u), s = o & 128;
  } while (s);
  return r.reduce((u, f) => u + 1 << 7 | f, -1);
}
function Ur(n, r) {
  let o = r, s = 4, u = null;
  do
    u = n.readUInt8(), o |= (u & 127) << s, s += 7;
  while (u & 128);
  return o;
}
class Q {
  constructor(r) {
    Object.assign(this, r), this.offsetCache = {};
  }
  static async fromIdx({ idx: r, getExternalRefDelta: o }) {
    const s = new z(r);
    if (s.slice(4).toString("hex") !== "ff744f63")
      return;
    const f = s.readUInt32BE();
    if (f !== 2)
      throw new _(
        `Unable to read version ${f} packfile IDX. (Only version 2 supported)`
      );
    if (r.byteLength > 2048 * 1024 * 1024)
      throw new _(
        "To keep implementation simple, I haven't implemented the layer 5 feature needed to support packfiles > 2GB in size."
      );
    s.seek(s.tell() + 4 * 255);
    const h = s.readUInt32BE(), a = [];
    for (let g = 0; g < h; g++) {
      const m = s.slice(20).toString("hex");
      a[g] = m;
    }
    s.seek(s.tell() + 4 * h);
    const w = /* @__PURE__ */ new Map();
    for (let g = 0; g < h; g++)
      w.set(a[g], s.readUInt32BE());
    const y = s.slice(20).toString("hex");
    return new Q({
      hashes: a,
      crcs: {},
      offsets: w,
      packfileSha: y,
      getExternalRefDelta: o
    });
  }
  static async fromPack({ pack: r, getExternalRefDelta: o, onProgress: s }) {
    const u = {
      1: "commit",
      2: "tree",
      3: "blob",
      4: "tag",
      6: "ofs-delta",
      7: "ref-delta"
    }, f = {}, h = r.slice(-20).toString("hex"), a = [], w = {}, y = /* @__PURE__ */ new Map();
    let g = null, m = null;
    await Xe([r], async ({ data: N, type: U, reference: M, offset: $, num: v }) => {
      g === null && (g = v);
      const R = Math.floor(
        (g - v) * 100 / g
      );
      R !== m && s && await s({
        phase: "Receiving objects",
        loaded: g - v,
        total: g
      }), m = R, U = u[U], ["commit", "tree", "blob", "tag"].includes(U) ? f[$] = {
        type: U,
        offset: $
      } : U === "ofs-delta" ? f[$] = {
        type: U,
        offset: $
      } : U === "ref-delta" && (f[$] = {
        type: U,
        offset: $
      });
    });
    const b = Object.keys(f).map(Number);
    for (const [N, U] of b.entries()) {
      const M = N + 1 === b.length ? r.byteLength - 20 : b[N + 1], $ = f[U], v = _e.buf(r.slice(U, M)) >>> 0;
      $.end = M, $.crc = v;
    }
    const B = new Q({
      pack: Promise.resolve(r),
      packfileSha: h,
      crcs: w,
      hashes: a,
      offsets: y,
      getExternalRefDelta: o
    });
    m = null;
    let T = 0;
    const L = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let N in f) {
      N = Number(N);
      const U = Math.floor(T * 100 / g);
      U !== m && s && await s({
        phase: "Resolving deltas",
        loaded: T,
        total: g
      }), T++, m = U;
      const M = f[N];
      if (!M.oid)
        try {
          B.readDepth = 0, B.externalReadDepth = 0;
          const { type: $, object: v } = await B.readSlice({ start: N });
          L[B.readDepth] += 1;
          const R = await jt(Ke.wrap({ type: $, object: v }));
          M.oid = R, a.push(R), y.set(R, N), w[R] = M.crc;
        } catch {
          continue;
        }
    }
    return a.sort(), B;
  }
  async toBuffer() {
    const r = [], o = (y, g) => {
      r.push(Buffer.from(y, g));
    };
    o("ff744f63", "hex"), o("00000002", "hex");
    const s = new z(Buffer.alloc(256 * 4));
    for (let y = 0; y < 256; y++) {
      let g = 0;
      for (const m of this.hashes)
        parseInt(m.slice(0, 2), 16) <= y && g++;
      s.writeUInt32BE(g);
    }
    r.push(s.buffer);
    for (const y of this.hashes)
      o(y, "hex");
    const u = new z(Buffer.alloc(this.hashes.length * 4));
    for (const y of this.hashes)
      u.writeUInt32BE(this.crcs[y]);
    r.push(u.buffer);
    const f = new z(Buffer.alloc(this.hashes.length * 4));
    for (const y of this.hashes)
      f.writeUInt32BE(this.offsets.get(y));
    r.push(f.buffer), o(this.packfileSha, "hex");
    const h = Buffer.concat(r), a = await jt(h), w = Buffer.alloc(20);
    return w.write(a, "hex"), Buffer.concat([h, w]);
  }
  async load({ pack: r }) {
    this.pack = r;
  }
  async unload() {
    this.pack = null;
  }
  async read({ oid: r }) {
    if (!this.offsets.get(r)) {
      if (this.getExternalRefDelta)
        return this.externalReadDepth++, this.getExternalRefDelta(r);
      throw new _(`Could not read object ${r} from packfile`);
    }
    const o = this.offsets.get(r);
    return this.readSlice({ start: o });
  }
  async readSlice({ start: r }) {
    if (this.offsetCache[r])
      return Object.assign({}, this.offsetCache[r]);
    this.readDepth++;
    const o = {
      16: "commit",
      32: "tree",
      48: "blob",
      64: "tag",
      96: "ofs_delta",
      112: "ref_delta"
    };
    if (!this.pack)
      throw new _(
        "Tried to read from a GitPackIndex with no packfile loaded into memory"
      );
    const s = (await this.pack).slice(r), u = new z(s), f = u.readUInt8(), h = f & 112;
    let a = o[h];
    if (a === void 0)
      throw new _("Unrecognized type: 0b" + h.toString(2));
    const w = f & 15;
    let y = w;
    f & 128 && (y = Ur(u, w));
    let m = null, b = null;
    if (a === "ofs_delta") {
      const T = Fr(u), L = r - T;
      ({ object: m, type: a } = await this.readSlice({ start: L }));
    }
    if (a === "ref_delta") {
      const T = u.slice(20).toString("hex");
      ({ object: m, type: a } = await this.read({ oid: T }));
    }
    const B = s.slice(u.tell());
    if (b = Buffer.from(await tr(B)), b.byteLength !== y)
      throw new _(
        `Packfile told us object would have length ${y} but it had length ${b.byteLength}`
      );
    return m && (b = Buffer.from(Je(b, m))), this.readDepth > 3 && (this.offsetCache[r] = { type: a, object: b }), { type: a, format: "content", object: b };
  }
}
class tt extends J {
  /**
   * @param {string} value
   */
  constructor(r) {
    super(`Expected a 40-char hex object id but saw "${r}".`), this.code = this.name = tt.code, this.data = { value: r };
  }
}
tt.code = "InvalidOidError";
class ct extends J {
  /**
   * @param {string} oid
   * @param {'blob'|'commit'|'tag'|'tree'} actual
   * @param {'blob'|'commit'|'tag'|'tree'} expected
   * @param {string} [filepath]
   */
  constructor(r, o, s, u) {
    super(
      `Object ${r} ${u ? `at ${u}` : ""}was anticipated to be a ${s} but it is a ${o}.`
    ), this.code = this.name = ct.code, this.data = { oid: r, actual: o, expected: s, filepath: u };
  }
}
ct.code = "ObjectTypeError";
async function Zt(n, r) {
  const o = Ht(n);
  for (; ; ) {
    const { value: s, done: u } = await o.next();
    if (s && await r(s), u)
      break;
  }
  o.return && o.return();
}
async function et(n) {
  let r = 0;
  const o = [];
  await Zt(n, (f) => {
    o.push(f), r += f.byteLength;
  });
  const s = new Uint8Array(r);
  let u = 0;
  for (const f of o)
    s.set(f, u), u += f.byteLength;
  return s;
}
class wt {
  constructor() {
    this._queue = [];
  }
  write(r) {
    if (this._ended)
      throw Error("You cannot write to a FIFO that has already been ended!");
    if (this._waiting) {
      const o = this._waiting;
      this._waiting = null, o({ value: r });
    } else
      this._queue.push(r);
  }
  end() {
    if (this._ended = !0, this._waiting) {
      const r = this._waiting;
      this._waiting = null, r({ done: !0 });
    }
  }
  destroy(r) {
    this.error = r, this.end();
  }
  async next() {
    if (this._queue.length > 0)
      return { value: this._queue.shift() };
    if (this._ended)
      return { done: !0 };
    if (this._waiting)
      throw Error(
        "You cannot call read until the previous call to read has returned!"
      );
    return new Promise((r) => {
      this._waiting = r;
    });
  }
}
class Sr {
  static demux(r) {
    const o = k.streamReader(r), s = new wt(), u = new wt(), f = new wt(), h = async function() {
      const a = await o();
      if (a === null)
        return h();
      if (a === !0) {
        s.end(), f.end(), r.error ? u.destroy(r.error) : u.end();
        return;
      }
      switch (a[0]) {
        case 1: {
          u.write(a.slice(1));
          break;
        }
        case 2: {
          f.write(a.slice(1));
          break;
        }
        case 3: {
          const w = a.slice(1);
          f.write(w), s.end(), f.end(), u.destroy(new Error(w.toString("utf8")));
          return;
        }
        default:
          s.write(a);
      }
      h();
    };
    return h(), {
      packetlines: s,
      packfile: u,
      progress: f
    };
  }
  // static mux ({
  //   protocol, // 'side-band' or 'side-band-64k'
  //   packetlines,
  //   packfile,
  //   progress,
  //   error
  // }) {
  //   const MAX_PACKET_LENGTH = protocol === 'side-band-64k' ? 999 : 65519
  //   let output = new PassThrough()
  //   packetlines.on('data', data => {
  //     if (data === null) {
  //       output.write(GitPktLine.flush())
  //     } else {
  //       output.write(GitPktLine.encode(data))
  //     }
  //   })
  //   let packfileWasEmpty = true
  //   let packfileEnded = false
  //   let progressEnded = false
  //   let errorEnded = false
  //   let goodbye = Buffer.concat([
  //     GitPktLine.encode(Buffer.from('010A', 'hex')),
  //     GitPktLine.flush()
  //   ])
  //   packfile
  //     .on('data', data => {
  //       packfileWasEmpty = false
  //       const buffers = splitBuffer(data, MAX_PACKET_LENGTH)
  //       for (const buffer of buffers) {
  //         output.write(
  //           GitPktLine.encode(Buffer.concat([Buffer.from('01', 'hex'), buffer]))
  //         )
  //       }
  //     })
  //     .on('end', () => {
  //       packfileEnded = true
  //       if (!packfileWasEmpty) output.write(goodbye)
  //       if (progressEnded && errorEnded) output.end()
  //     })
  //   progress
  //     .on('data', data => {
  //       const buffers = splitBuffer(data, MAX_PACKET_LENGTH)
  //       for (const buffer of buffers) {
  //         output.write(
  //           GitPktLine.encode(Buffer.concat([Buffer.from('02', 'hex'), buffer]))
  //         )
  //       }
  //     })
  //     .on('end', () => {
  //       progressEnded = true
  //       if (packfileEnded && errorEnded) output.end()
  //     })
  //   error
  //     .on('data', data => {
  //       const buffers = splitBuffer(data, MAX_PACKET_LENGTH)
  //       for (const buffer of buffers) {
  //         output.write(
  //           GitPktLine.encode(Buffer.concat([Buffer.from('03', 'hex'), buffer]))
  //         )
  //       }
  //     })
  //     .on('end', () => {
  //       errorEnded = true
  //       if (progressEnded && packfileEnded) output.end()
  //     })
  //   return output
  // }
}
async function Qt(n) {
  const { packetlines: r, packfile: o, progress: s } = Sr.demux(n), u = [], f = [], h = [];
  let a = !1, w = !1;
  return new Promise((y, g) => {
    Zt(r, (m) => {
      const b = m.toString("utf8").trim();
      if (b.startsWith("shallow")) {
        const B = b.slice(-41).trim();
        B.length !== 40 && g(new tt(B)), u.push(B);
      } else if (b.startsWith("unshallow")) {
        const B = b.slice(-41).trim();
        B.length !== 40 && g(new tt(B)), f.push(B);
      } else if (b.startsWith("ACK")) {
        const [, B, T] = b.split(" ");
        h.push({ oid: B, status: T }), T || (w = !0);
      } else
        b.startsWith("NAK") ? (a = !0, w = !0) : (w = !0, a = !0);
      w && (n.error ? g(n.error) : y({ shallows: u, unshallows: f, acks: h, nak: a, packfile: o, progress: s }));
    }).finally(() => {
      w || (n.error ? g(n.error) : y({ shallows: u, unshallows: f, acks: h, nak: a, packfile: o, progress: s }));
    });
  });
}
typeof window < "u" && (window.Buffer = H.Buffer);
async function Xr(n, r, o) {
  const s = await ee(n, r), u = await $r(s, r, o), f = await Rr(
    n,
    o.map((a) => u[a].oid)
  ), h = {};
  return await Promise.all(
    o.map(async (a) => {
      h[a] = await re(
        f,
        u[a].oid
      );
    })
  ), h;
}
async function Zr(n, r) {
  const o = await ee(n, r), s = await Tr(o, r);
  return s != null && s.object ? te(s) : [];
}
async function Qr(n, r) {
  switch ((r.type === "infer" || r.type === void 0) && (["", "HEAD"].includes(r.value) ? r = {
    value: r.value,
    type: "refname"
  } : typeof r.value == "string" && r.value.length === 40 && (r = {
    value: r.value,
    type: "commit"
  })), r.type === "branch" && (r = {
    value: `refs/heads/${r.value}`,
    type: "refname"
  }), r.type) {
    case "commit":
      return r.value;
    case "refname": {
      const o = await kr(n, r.value);
      if (!(r.value in o))
        throw new Error(`Branch ${r.value} not found`);
      return o[r.value];
    }
    default:
      throw new Error(`Invalid ref type: ${r.type}`);
  }
}
function te(n) {
  return n.object.map((r) => {
    if (r.type === "blob")
      return {
        name: r.path,
        type: "file"
      };
    if (r.type === "tree" && r.object)
      return {
        name: r.path,
        type: "folder",
        children: te(r)
      };
  }).filter((r) => !!(r != null && r.name));
}
async function kr(n, r) {
  const o = H.Buffer.from(
    await et([
      k.encode(`command=ls-refs
`),
      k.encode(`agent=git/2.37.3
`),
      k.encode(`object-format=sha1
`),
      k.delim(),
      k.encode(`peel
`),
      k.encode(`ref-prefix ${r}
`),
      k.flush()
    ])
  ), s = await fetch(n + "/git-upload-pack", {
    method: "POST",
    headers: {
      Accept: "application/x-git-upload-pack-advertisement",
      "content-type": "application/x-git-upload-pack-request",
      "Content-Length": `${o.length}`,
      "Git-Protocol": "version=2"
    },
    body: o
  }), u = {};
  for await (const f of Cr(s)) {
    const h = f.indexOf(" "), a = f.slice(0, h), w = f.slice(h + 1, f.length - 1);
    u[w] = a;
  }
  return u;
}
async function ee(n, r) {
  const o = H.Buffer.from(
    await et([
      k.encode(
        `want ${r} multi_ack_detailed no-done side-band-64k thin-pack ofs-delta agent=git/2.37.3 filter 
`
      ),
      k.encode(`filter blob:none
`),
      k.encode(`shallow ${r}
`),
      k.encode(`deepen 1
`),
      k.flush(),
      k.encode(`done
`),
      k.encode(`done
`)
    ])
  ), s = await fetch(n + "/git-upload-pack", {
    method: "POST",
    headers: {
      Accept: "application/x-git-upload-pack-advertisement",
      "content-type": "application/x-git-upload-pack-request",
      "Content-Length": `${o.length}`
    },
    body: o
  }), u = ne(s.body), f = await Qt(u), h = H.Buffer.from(await et(f.packfile)), a = await Q.fromPack({
    pack: h
  }), w = a.read;
  return a.read = async function({ oid: y, ...g }) {
    const m = await w.call(this, { oid: y, ...g });
    return m.oid = y, m;
  }, a;
}
async function Tr(n, r) {
  const o = await n.read({
    oid: r
  });
  W(o);
  const s = await n.read({ oid: o.object.tree }), u = [s];
  for (; u.length > 0; ) {
    const f = u.pop(), h = await n.read({ oid: f.oid });
    if (W(h), f.object = h.object, h.type === "tree")
      for (const a of h.object)
        a.type === "tree" && u.push(a);
  }
  return s;
}
async function $r(n, r, o) {
  const s = await n.read({
    oid: r
  });
  W(s);
  const u = await n.read({ oid: s.object.tree });
  W(u);
  const f = {};
  for (const h of o) {
    let a = u;
    const w = h.split("/");
    for (const y of w) {
      if (a.type !== "tree")
        throw new Error(`Path not found in the repo: ${h}`);
      let g = !1;
      for (const m of a.object)
        if (m.path === y) {
          try {
            a = await n.read({ oid: m.oid }), W(a);
          } catch {
            a = m;
          }
          g = !0;
          break;
        }
      if (!g)
        throw new Error(`Path not found in the repo: ${h}`);
    }
    f[h] = a;
  }
  return f;
}
async function Rr(n, r) {
  const o = H.Buffer.from(
    await et([
      ...r.map(
        (a) => k.encode(
          `want ${a} multi_ack_detailed no-done side-band-64k thin-pack ofs-delta agent=git/2.37.3 
`
        )
      ),
      k.flush(),
      k.encode(`done
`)
    ])
  ), s = await fetch(n + "/git-upload-pack", {
    method: "POST",
    headers: {
      Accept: "application/x-git-upload-pack-advertisement",
      "content-type": "application/x-git-upload-pack-request",
      "Content-Length": `${o.length}`
    },
    body: o
  }), u = ne(s.body), f = await Qt(u), h = H.Buffer.from(await et(f.packfile));
  return await Q.fromPack({
    pack: h
  });
}
async function re(n, r) {
  const o = await n.read({ oid: r });
  if (W(o), o.type === "blob")
    return o.object;
  const s = {};
  for (const { path: u, oid: f, type: h } of o.object)
    if (h === "blob") {
      const a = await n.read({ oid: f });
      W(a), s[u] = a.object;
    } else
      h === "tree" && (s[u] = await re(n, f));
  return s;
}
function W(n) {
  if (n.object instanceof H.Buffer)
    switch (n.type) {
      case "commit":
        n.object = O.from(n.object).parse();
        break;
      case "tree":
        n.object = bt.from(n.object).entries();
        break;
      case "blob":
        n.object = new Uint8Array(n.object), n.format = "content";
        break;
      case "tag":
        n.object = Z.from(n.object).parse();
        break;
      default:
        throw new ct(
          n.oid,
          n.type,
          "blob|commit|tag|tree"
        );
    }
}
async function* Cr(n) {
  const r = await n.text();
  let o = 0;
  for (; o <= r.length; ) {
    const s = parseInt(r.substring(o, o + 4), 16);
    if (s === 0)
      break;
    yield r.substring(o + 4, o + s), o += s;
  }
}
function ne(n) {
  if (n[Symbol.asyncIterator])
    return n;
  const r = n.getReader();
  return {
    next() {
      return r.read();
    },
    return() {
      return r.releaseLock(), {};
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
function tn(n, r) {
  r = Mt(r);
  const o = ["", ".", "/"].includes(r);
  let s = n;
  if (o)
    r = "";
  else {
    const h = r.split("/");
    for (const a of h) {
      const w = s == null ? void 0 : s.find(
        (y) => y.name === a
      );
      if ((w == null ? void 0 : w.type) === "folder")
        s = w.children;
      else
        return w ? [w.name] : [];
    }
  }
  const u = [], f = [{ tree: s, path: r }];
  for (; f.length > 0; ) {
    const { tree: h, path: a } = f.pop();
    for (const w of h) {
      const y = `${a}${a ? "/" : ""}${w.name}`;
      w.type === "folder" ? f.push({
        tree: w.children,
        path: y
      }) : u.push(y);
    }
  }
  return u;
}
function en(n, r) {
  return n.startsWith(r) ? n.substring(r.length) : n;
}
export {
  Yr as changeset,
  Kr as clearContentsFromMountDevice,
  jr as createClient,
  qr as createCommit,
  Gr as createOrUpdateBranch,
  zr as createTree,
  Ct as createTreeNode,
  ke as createTreeNodes,
  Te as deleteFile,
  Ce as directoryHandleFromMountDevice,
  Vr as directoryHandleToOpfsPath,
  Lr as filesListToObject,
  Hr as fork,
  Mr as getArtifact,
  Ae as getFilesFromDirectory,
  Wr as iterateFiles,
  tn as listDescendantFiles,
  Zr as listGitFiles,
  kr as listGitRefs,
  vr as mayPush,
  Oe as opfsPathToDirectoryHandle,
  en as removePathPrefix,
  Qr as resolveCommitHash,
  Xr as sparseCheckout
};
//# sourceMappingURL=index.js.map
