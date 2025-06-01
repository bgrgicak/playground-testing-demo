<?php
/**
 * Plugin Name: Workshop Building Automated Tests with WordPress Playground
 * Description: A simple plugin that adds a Hello World admin page
 * Version: 1.0.0
 * Author: Workshop
 */

namespace PTD;

if (!defined('ABSPATH')) {
    exit;
}

function init() {
    require_once plugin_dir_path(__FILE__) . 'lib/admin.php';
    require_once plugin_dir_path(__FILE__) . 'lib/api.php';
}

add_action('init', 'PTD\init');
