import{joinPaths as a,phpVar as l}from"@php-wasm/util";import{createMemoizedFetch as _,unzipFile as d}from"@wp-playground/common";import{PHPRequestHandler as g,withPHPIniValues as f,PHP as h,setPhpIniEntries as w,writeFiles as m,proxyFileSystem as b,rotatePHPRuntime as y}from"@php-wasm/universal";import{logger as $}from"@php-wasm/logger";async function q(e){async function r(n,o){const s=new h(await e.createPhpRuntime());return e.sapiName&&s.setSapiName(e.sapiName),n&&(s.requestHandler=n),e.phpIniEntries&&w(s,e.phpIniEntries),o?(await T(s),await m(s,"/",e.createFiles||{}),await L(s,a(new URL(e.siteUrl).pathname,"phpinfo.php"))):b(await n.getPrimaryPhp(),s,["/tmp",n.documentRoot,"/internal/shared"]),e.spawnHandler&&await s.setSpawnHandler(e.spawnHandler(n.processManager)),y({php:s,cwd:n.documentRoot,recreateRuntime:e.createPhpRuntime,maxRequests:400}),s}const i=new g({phpFactory:async({isPrimary:n})=>r(i,n),documentRoot:e.documentRoot||"/wordpress",absoluteUrl:e.siteUrl,rewriteRules:S,getFileNotFoundAction:e.getFileNotFoundAction??E}),t=await i.getPrimaryPhp();if(e.hooks?.beforeWordPressFiles&&await e.hooks.beforeWordPressFiles(t),e.wordPressZip&&await v(t,await e.wordPressZip),e.constants)for(const n in e.constants)t.defineConstant(n,e.constants[n]);if(t.defineConstant("WP_HOME",e.siteUrl),t.defineConstant("WP_SITEURL",e.siteUrl),e.hooks?.beforeDatabaseSetup&&await e.hooks.beforeDatabaseSetup(t),e.sqliteIntegrationPluginZip&&await I(t,await e.sqliteIntegrationPluginZip),await c(t)||await P(t),!await c(t))throw new Error("WordPress installation has failed.");return i}async function c(e){return(await e.run({code:`<?php
$wp_load = getenv('DOCUMENT_ROOT') . '/wp-load.php';
if (!file_exists($wp_load)) {
	echo '0';
	exit;
}
require $wp_load;
echo is_blog_installed() ? '1' : '0';
`,env:{DOCUMENT_ROOT:e.documentRoot}})).text==="1"}async function P(e){await f(e,{disable_functions:"fsockopen",allow_url_fopen:"0"},async()=>await e.request({url:"/wp-admin/install.php?step=2",method:"POST",body:{language:"en",prefix:"wp_",weblog_title:"My WordPress Website",user_name:"admin",admin_password:"password",admin_password2:"password",Submit:"Install WordPress",pw_weak:"1",admin_email:"admin@localhost.com"}})),(await e.run({code:`<?php
$wp_load = getenv('DOCUMENT_ROOT') . '/wp-load.php';
if (!file_exists($wp_load)) {
	echo '0';
	exit;
}
require $wp_load;
$option_result = update_option(
	'permalink_structure',
	'/%year%/%monthnum%/%day%/%postname%/'
);
echo $option_result ? '1' : '0';
`,env:{DOCUMENT_ROOT:e.documentRoot}})).text!=="1"&&$.warn("Failed to default to pretty permalinks after WP install.")}function E(e){return{type:"internal-redirect",uri:"/index.php"}}async function A(e){const t=(await(await e.getPrimaryPhp()).run({code:`<?php
			require '${e.documentRoot}/wp-includes/version.php';
			echo $wp_version;
		`})).text;if(!t)throw new Error("Unable to read loaded WordPress version.");return R(t)}function R(e){if(/-(alpha|beta|RC)\d*-\d+$/.test(e))return"nightly";if(/-(beta|RC)\d*$/.test(e))return"beta";const t=e.match(/^(\d+\.\d+)(?:\.\d+)?$/);return t!==null?t[1]:e}const S=[{match:/^\/(.*?)(\/wp-(content|admin|includes)\/.*)/g,replacement:"$2"}];async function T(e){await e.mkdir("/internal/shared/mu-plugins"),await e.writeFile("/internal/shared/preload/env.php",`<?php

        // Allow adding filters/actions prior to loading WordPress.
        // $function_to_add MUST be a string.
        function playground_add_filter( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
            global $wp_filter;
            $wp_filter[$tag][$priority][$function_to_add] = array('function' => $function_to_add, 'accepted_args' => $accepted_args);
        }
        function playground_add_action( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
            playground_add_filter( $tag, $function_to_add, $priority, $accepted_args );
        }

        // Load our mu-plugins after customer mu-plugins
        // NOTE: this means our mu-plugins can't use the muplugins_loaded action!
        playground_add_action( 'muplugins_loaded', 'playground_load_mu_plugins', 0 );
        function playground_load_mu_plugins() {
            // Load all PHP files from /internal/shared/mu-plugins, sorted by filename
            $mu_plugins_dir = '/internal/shared/mu-plugins';
            if(!is_dir($mu_plugins_dir)){
                return;
            }
            $mu_plugins = glob( $mu_plugins_dir . '/*.php' );
            sort( $mu_plugins );
            foreach ( $mu_plugins as $mu_plugin ) {
                require_once $mu_plugin;
            }
        }
    `),await e.writeFile("/internal/shared/mu-plugins/1-auto-login.php",`<?php
		/**
		 * Returns the username to auto-login as, if any.
		 * @return string|false
		 */
		function playground_get_username_for_auto_login() {
			/**
			 * Allow users to auto-login as a specific user on their first visit.
			 *
			 * Prevent the auto-login if it already happened by checking for the
			 * playground_auto_login_already_happened cookie.
			 * This is used to allow the user to logout.
			 */
			if ( defined('PLAYGROUND_AUTO_LOGIN_AS_USER') && !isset($_COOKIE['playground_auto_login_already_happened']) ) {
				return PLAYGROUND_AUTO_LOGIN_AS_USER;
			}
			/**
			 * Allow users to auto-login as a specific user by passing the
			 * playground_force_auto_login_as_user GET parameter.
			 */
			if ( defined('PLAYGROUND_FORCE_AUTO_LOGIN_ENABLED') && isset($_GET['playground_force_auto_login_as_user']) ) {
				return $_GET['playground_force_auto_login_as_user'];
			}
			return false;
		}

		/**
		 * Logs the user in on their first visit if the Playground runtime told us to.
		 */
		function playground_auto_login() {
			/**
			 * The redirect should only run if the current PHP request is
			 * a HTTP request. If it's a PHP CLI run, we can't login the user
			 * because logins require cookies which aren't available in the CLI.
			 *
			 * Currently all Playground requests use the "cli" SAPI name
			 * to ensure support for WP-CLI, so the best way to distinguish
			 * between a CLI run and an HTTP request is by checking if the
			 * $_SERVER['REQUEST_URI'] global is set.
			 *
			 * If $_SERVER['REQUEST_URI'] is not set, we assume it's a CLI run.
			 */
			if (empty($_SERVER['REQUEST_URI'])) {
				return;
			}
			$user_name = playground_get_username_for_auto_login();
			if ( false === $user_name ) {
				return;
			}
			if (wp_doing_ajax() || defined('REST_REQUEST')) {
				return;
			}
			if ( is_user_logged_in() ) {
				return;
			}
			$user = get_user_by('login', $user_name);
			if (!$user) {
				return;
			}

			/**
			 * We're about to set cookies and redirect. It will log the user in
			 * if the headers haven't been sent yet.
			 *
			 * However, if they have been sent already – e.g. there a PHP
			 * notice was printed, we'll exit the script with a bunch of errors
			 * on the screen and without the user being logged in. This
			 * will happen on every page load and will effectively make Playground
			 * unusable.
			 *
			 * Therefore, we just won't auto-login if headers have been sent. Maybe
			 * we'll be able to finish the operation in one of the future requests
			 * or maybe not, but at least we won't end up with a permanent white screen.
			 */
			if (headers_sent()) {
				_doing_it_wrong('playground_auto_login', 'Headers already sent, the Playground runtime will not auto-login the user', '1.0.0');
				return;
			}

			/**
			 * This approach is described in a comment on
			 * https://developer.wordpress.org/reference/functions/wp_set_current_user/
			 */
			wp_set_current_user( $user->ID, $user->user_login );
			wp_set_auth_cookie( $user->ID );
			do_action( 'wp_login', $user->user_login, $user );

			setcookie('playground_auto_login_already_happened', '1');

			/**
			 * Confirm that nothing in WordPress, plugins, or filters have finalized
			 * the headers sending phase. See the comment above for more context.
			 */
			if (headers_sent()) {
				_doing_it_wrong('playground_auto_login', 'Headers already sent, the Playground runtime will not auto-login the user', '1.0.0');
				return;
			}

			/**
			 * Reload page to ensure the user is logged in correctly.
			 * WordPress uses cookies to determine if the user is logged in,
			 * so we need to reload the page to ensure the cookies are set.
			 */
			$redirect_url = $_SERVER['REQUEST_URI'];
			/**
			 * Intentionally do not use wp_redirect() here. It removes
			 * %0A and %0D sequences from the URL, which we don't want.
			 * There are valid use-cases for encoded newlines in the query string,
			 * for example html-api-debugger accepts markup with newlines
			 * encoded as %0A via the query string.
			 */
			header( "Location: $redirect_url", true, 302 );
			exit;
		}
		/**
		 * Autologin users from the wp-login.php page.
		 *
		 * The wp hook isn't triggered on
		 **/
		add_action('init', 'playground_auto_login', 1);

		/**
		 * Disable the Site Admin Email Verification Screen for any session started
		 * via autologin.
		 */
		add_filter('admin_email_check_interval', function($interval) {
			if(false === playground_get_username_for_auto_login()) {
				return 0;
			}
			return $interval;
		});
		`),await e.writeFile("/internal/shared/mu-plugins/0-playground.php",`<?php
        // Needed because gethostbyname( 'wordpress.org' ) returns
        // a private network IP address for some reason.
        add_filter( 'allowed_redirect_hosts', function( $deprecated = '' ) {
            return array(
                'wordpress.org',
                'api.wordpress.org',
                'downloads.wordpress.org',
            );
        } );

		// Support pretty permalinks
        add_filter( 'got_url_rewrite', '__return_true' );

        // Create the fonts directory if missing
        if(!file_exists(WP_CONTENT_DIR . '/fonts')) {
            mkdir(WP_CONTENT_DIR . '/fonts');
        }

        $log_file = WP_CONTENT_DIR . '/debug.log';
        define('ERROR_LOG_FILE', $log_file);
        ini_set('error_log', $log_file);
        ?>`),await e.writeFile("/internal/shared/preload/error-handler.php",`<?php
		(function() {
			$playground_consts = [];
			if(file_exists('/internal/shared/consts.json')) {
				$playground_consts = @json_decode(file_get_contents('/internal/shared/consts.json'), true) ?: [];
				$playground_consts = array_keys($playground_consts);
			}
			set_error_handler(function($severity, $message, $file, $line) use($playground_consts) {
				/**
				 * This is a temporary workaround to hide the 32bit integer warnings that
				 * appear when using various time related function, such as strtotime and mktime.
				 * Examples of the warnings that are displayed:
				 *
				 * Warning: mktime(): Epoch doesn't fit in a PHP integer in <file>
				 * Warning: strtotime(): Epoch doesn't fit in a PHP integer in <file>
				 */
				if (strpos($message, "fit in a PHP integer") !== false) {
					return;
				}
				/**
				 * Networking support in Playground registers a http_api_transports filter.
				 *
				 * This filter is deprecated, and no longer actively used, but is needed for wp_http_supports().
				 * @see https://core.trac.wordpress.org/ticket/37708
				 */
				if (
					strpos($message, "http_api_transports") !== false &&
					strpos($message, "since version 6.4.0 with no alternative available") !== false
				) {
					return;
				}
				/**
				 * Playground defines some constants upfront, and some of them may be redefined
				 * in wp-config.php. For example, SITE_URL or WP_DEBUG. This is expected and
				 * we want Playground constants to take priority without showing warnings like:
				 *
				 * Warning: Constant SITE_URL already defined in
				 */
				if (strpos($message, "already defined") !== false) {
					foreach($playground_consts as $const) {
						if(strpos($message, "Constant $const already defined") !== false) {
							return;
						}
					}
				}
				/**
				 * Don't complain about network errors when not connected to the network.
				 */
				if (
					(
						! defined('USE_FETCH_FOR_REQUESTS') ||
						! USE_FETCH_FOR_REQUESTS
					) &&
					strpos($message, "WordPress could not establish a secure connection to WordPress.org") !== false)
				{
					return;
				}
				return false;
			});
		})();`)}async function L(e,r="/phpinfo.php"){await e.writeFile("/internal/shared/preload/phpinfo.php",`<?php
    // Render PHPInfo if the requested page is /phpinfo.php
    if ( ${l(r)} === $_SERVER['REQUEST_URI'] ) {
        phpinfo();
        exit;
    }
    `)}async function I(e,r){await e.isDir("/tmp/sqlite-database-integration")&&await e.rmdir("/tmp/sqlite-database-integration",{recursive:!0}),await e.mkdir("/tmp/sqlite-database-integration"),await d(e,r,"/tmp/sqlite-database-integration");const i="/internal/shared/sqlite-database-integration",t=await e.isDir("/tmp/sqlite-database-integration/sqlite-database-integration-main")?"/tmp/sqlite-database-integration/sqlite-database-integration-main":"/tmp/sqlite-database-integration/sqlite-database-integration-develop";await e.mv(t,i),await e.defineConstant("SQLITE_MAIN_FILE","1");const o=(await e.readFileAsText(a(i,"db.copy"))).replace("'{SQLITE_IMPLEMENTATION_FOLDER_PATH}'",l(i)).replace("'{SQLITE_PLUGIN}'",l(a(i,"load.php"))),s=a(await e.documentRoot,"wp-content/db.php"),u=`<?php
	// Do not preload this if WordPress comes with a custom db.php file.
	if(file_exists(${l(s)})) {
		return;
	}
	?>`,p="/internal/shared/mu-plugins/sqlite-database-integration.php";await e.writeFile(p,u+o),await e.writeFile("/internal/shared/preload/0-sqlite.php",u+`<?php

/**
 * Loads the SQLite integration plugin before WordPress is loaded
 * and without creating a drop-in "db.php" file.
 *
 * Technically, it creates a global $wpdb object whose only two
 * purposes are to:
 *
 * * Exist – because the require_wp_db() WordPress function won't
 *           connect to MySQL if $wpdb is already set.
 * * Load the SQLite integration plugin the first time it's used
 *   and replace the global $wpdb reference with the SQLite one.
 *
 * This lets Playground keep the WordPress installation clean and
 * solves dillemas like:
 *
 * * Should we include db.php in Playground exports?
 * * Should we remove db.php from Playground imports?
 * * How should we treat stale db.php from long-lived OPFS sites?
 *
 * @see https://github.com/WordPress/wordpress-playground/discussions/1379 for
 *      more context.
 */
class Playground_SQLite_Integration_Loader {
	public function __call($name, $arguments) {
		$this->load_sqlite_integration();
		if($GLOBALS['wpdb'] === $this) {
			throw new Exception('Infinite loop detected in $wpdb – SQLite integration plugin could not be loaded');
		}
		return call_user_func_array(
			array($GLOBALS['wpdb'], $name),
			$arguments
		);
	}
	public function __get($name) {
		$this->load_sqlite_integration();
		if($GLOBALS['wpdb'] === $this) {
			throw new Exception('Infinite loop detected in $wpdb – SQLite integration plugin could not be loaded');
		}
		return $GLOBALS['wpdb']->$name;
	}
	public function __set($name, $value) {
		$this->load_sqlite_integration();
		if($GLOBALS['wpdb'] === $this) {
			throw new Exception('Infinite loop detected in $wpdb – SQLite integration plugin could not be loaded');
		}
		$GLOBALS['wpdb']->$name = $value;
	}
    protected function load_sqlite_integration() {
        require_once ${l(p)};
    }
}
$wpdb = $GLOBALS['wpdb'] = new Playground_SQLite_Integration_Loader();

/**
 * WordPress is capable of using a preloaded global $wpdb. However, if
 * it cannot find the drop-in db.php plugin it still checks whether
 * the mysqli_connect() function exists even though it's not used.
 *
 * What WordPress demands, Playground shall provide.
 */
if(!function_exists('mysqli_connect')) {
	function mysqli_connect() {}
}

		`),await e.writeFile("/internal/shared/mu-plugins/sqlite-test.php",`<?php
		global $wpdb;
		if(!($wpdb instanceof WP_SQLite_DB)) {
			var_dump(isset($wpdb));
			die("SQLite integration not loaded " . get_class($wpdb));
		}
		`)}async function v(e,r){e.mkdir("/tmp/unzipped-wordpress"),await d(e,r,"/tmp/unzipped-wordpress"),e.fileExists("/tmp/unzipped-wordpress/wordpress.zip")&&await d(e,"/tmp/unzipped-wordpress/wordpress.zip","/tmp/unzipped-wordpress");let i=e.fileExists("/tmp/unzipped-wordpress/wordpress")?"/tmp/unzipped-wordpress/wordpress":e.fileExists("/tmp/unzipped-wordpress/build")?"/tmp/unzipped-wordpress/build":"/tmp/unzipped-wordpress";if(!e.fileExists(a(i,"wp-config-sample.php"))){const t=e.listFiles(i);if(t.length){const n=t[0];e.fileExists(a(i,n,"wp-config-sample.php"))&&(i=a(i,n))}}if(e.isDir(e.documentRoot)&&U(e.documentRoot,e)){for(const t of e.listFiles(i)){const n=a(i,t),o=a(e.documentRoot,t);e.mv(n,o)}e.rmdir(i,{recursive:!0})}else e.mv(i,e.documentRoot);!e.fileExists(a(e.documentRoot,"wp-config.php"))&&e.fileExists(a(e.documentRoot,"wp-config-sample.php"))&&e.writeFile(a(e.documentRoot,"wp-config.php"),e.readFileAsText(a(e.documentRoot,"/wp-config-sample.php")))}function U(e,r){const i=r.listFiles(e);return i.length===0||i.length===1&&i[0]==="playground-site-metadata.json"}const O=_(fetch);async function N(e="latest"){if(e.startsWith("https://")||e.startsWith("http://")){const t=await crypto.subtle.digest("SHA-1",new TextEncoder().encode(e)),n=Array.from(new Uint8Array(t)).map(o=>o.toString(16).padStart(2,"0")).join("");return{releaseUrl:e,version:"custom-"+n.substring(0,8),source:"inferred"}}else if(e==="trunk"||e==="nightly")return{releaseUrl:"https://wordpress.org/nightly-builds/wordpress-latest.zip",version:"nightly-"+new Date().toISOString().split("T")[0],source:"inferred"};let i=await(await O("https://api.wordpress.org/core/version-check/1.7/?channel=beta")).json();i=i.offers.filter(t=>t.response==="autoupdate");for(const t of i){if(e==="beta"&&t.version.includes("beta"))return{releaseUrl:t.download,version:t.version,source:"api"};if(e==="latest"&&!t.version.includes("beta"))return{releaseUrl:t.download,version:t.version,source:"api"};if(t.version.substring(0,e.length)===e)return{releaseUrl:t.download,version:t.version,source:"api"}}return{releaseUrl:`https://wordpress.org/wordpress-${e}.zip`,version:e,source:"inferred"}}export{q as bootWordPress,E as getFileNotFoundActionForWordPress,A as getLoadedWordPressVersion,L as preloadPhpInfoRoute,I as preloadSqliteIntegration,N as resolveWordPressRelease,T as setupPlatformLevelMuPlugins,v as unzipWordPress,R as versionStringToLoadedWordPressVersion,S as wordPressRewriteRules};
//# sourceMappingURL=index.js.map
