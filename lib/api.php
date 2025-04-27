<?php

namespace WCEUPT;

if (!defined('ABSPATH')) {
    exit;
}

const OPTIONS_KEY = 'wceupt_messages';

function register_rest_routes() {
    register_rest_route('wceupt/v1', '/hello/', array(
        'methods' => 'POST',
        'callback' => 'WCEUPT\hello_endpoint',
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
add_action('rest_api_init', 'WCEUPT\register_rest_routes');

function hello_endpoint($request) {
    $name = $request->get_param('name');
    $new_message = hello_response_message($name);
    save_message($new_message);
    return array(
        'success' => true,
        'message' => $new_message
    );
}

function hello_response_message($message) {
    return "User says: $message";
}

function get_messages() {
    return get_option(OPTIONS_KEY, array());
}

function save_message($message) {
    $options = get_messages();
    $options[] = $message;
    update_option(OPTIONS_KEY, $options);
}