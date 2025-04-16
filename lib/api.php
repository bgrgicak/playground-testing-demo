<?php

if (!defined('ABSPATH')) {
    exit;
}

const WBATWP_OPTIONS_KEY = 'wbatwp_options';

function wbatwp_register_rest_routes() {
    register_rest_route('wbatwp/v1', '/hello/', array(
        'methods' => 'POST',
        'callback' => 'wbatwp_hello_endpoint',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'args' => array(
            'name' => array(
                'required' => true,
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));
}
add_action('rest_api_init', 'wbatwp_register_rest_routes');

function wbatwp_hello_endpoint($request) {
    $name = $request->get_param('name');
    // append message to a options entry
    $new_message = wbatwp_hello_response_message($name);
    $options = get_option(WBATWP_OPTIONS_KEY);
    $options[] = $new_message;
    update_option(WBATWP_OPTIONS_KEY, $options);
    return array(
        'success' => true,
        'message' => $new_message
    );
}

function wbatwp_hello_response_message($message) {
    return "User says: $message";
}