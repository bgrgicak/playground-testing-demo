<?php
/**
 * Plugin Name: Workshop Building Automated Tests with WordPress Playground
 * Description: A simple plugin that adds a Hello World admin page
 * Version: 1.0.0
 * Author: Workshop
 */

if (!defined('ABSPATH')) {
    exit;
}


function wbatwp_init() {
    require_once plugin_dir_path(__FILE__) . 'lib/admin-page.php';
    require_once plugin_dir_path(__FILE__) . 'lib/api.php';
}
add_action('init', 'wbatwp_init');
