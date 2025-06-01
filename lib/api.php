<?php

namespace PTD;

if (!defined('ABSPATH')) {
    exit;
}

const OPTIONS_KEY = 'PTD_messages';

function register_rest_routes() {
    register_rest_route('PTD/v1', '/message/', array(
        'methods' => 'POST',
        'callback' => 'PTD\message_endpoint',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'args' => array(
            'message' => array(
                'required' => true,
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));
}
add_action('rest_api_init', 'PTD\register_rest_routes');

function message_endpoint($request) {
    $message = $request->get_param('message');
    $new_message = get_response_message($message);
    if (false ===   save_message($new_message)) {
        return array(
            'success' => false,
            'message' => 'Failed to save message'
        );
    }
    return array(
        'success' => true,
        'message' => $new_message
    );
}

function get_response_message($message) {
    return "User says: $message";
}

function get_messages() {
    return get_option(OPTIONS_KEY, array());
}

function save_message($message) {
    $options = get_messages();
    $options[] = $message;
    return update_option(OPTIONS_KEY, $options);
}