<?php

namespace PTD;

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . 'api.php';

function add_admin_menu() {
    add_menu_page(
        'Workshop Tests',
        'Workshop Tests',
        'manage_options',
        'workshop-tests',
        'PTD\admin_page',
        'dashicons-admin-generic',
        30
    );
}
add_action('admin_menu', 'PTD\add_admin_menu');

function admin_page() {
    ?>
    <div class="wrap" style="max-width: 200px; display: flex; flex-direction: column; gap: 10px;">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <ul id="api-responses">
            <?php foreach (get_messages() as $message) : ?>
                <li><?php echo esc_html($message); ?></li>
            <?php endforeach; ?>
        </ul>
        <div class="form-wrap">
            <form id="hello-form" class="form-table">
                <div class="form-field" style="display: flex; flex-direction: row; gap: 10px;">
                    <input type="text" id="message" name="message" placeholder="Enter a message" required>
                    <button type="submit" class="button button-primary">Send</button>
                </div>
            </form>
        </div>
    </div>
    <script>
    jQuery(document).ready(function($) {
        $('#hello-form').on('submit', async function(e) {
            e.preventDefault();
            const message = $('#message').val();
            try {
                const formData = new FormData();
                formData.append('message', message);
                const response = await fetch(
                    `<?php echo esc_url_raw(rest_url('PTD/v1/message')); ?>`,
                    {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
                        },
                        body: formData
                    }
                );
                const data = await response.json();
                if (data.success) {
                    $('#api-responses').append(`<li>${data.message}</li>`);
                    $('#message').val('');
                } else {
                    console.error('API request failed:', data.message);
                }
            } catch (error) {
                console.error('API request failed:', error);
            }
        });
    });
    </script>
    <?php
}