<?php

if (!defined('ABSPATH')) {
    exit;
}

function wbatwp_get_messages() {
    return get_option(WBATWP_OPTIONS_KEY);
}

function wbatwp_add_admin_menu() {
    add_menu_page(
        'Workshop Tests',
        'Workshop Tests',
        'manage_options',
        'workshop-tests',
        'wbatwp_admin_page',
        'dashicons-admin-generic',
        30
    );
}
add_action('admin_menu', 'wbatwp_add_admin_menu');

function wbatwp_admin_page() {
    ?>
    <div class="wrap" style="max-width: 200px; display: flex; flex-direction: column; gap: 10px;">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <ul id="api-responses">
            <?php foreach (wbatwp_get_messages() as $message) : ?>
                <li><?php echo esc_html($message); ?></li>
            <?php endforeach; ?>
        </ul>
        <div class="form-wrap">
            <form id="hello-form" class="form-table">
                <div class="form-field" style="display: flex; flex-direction: row; gap: 10px;">
                    <input type="text" id="name" name="name" placeholder="Enter a message" required>
                    <button type="submit" class="button button-primary">Send</button>
                </div>
            </form>
        </div>
    </div>
    <script>
    jQuery(document).ready(function($) {
        $('#hello-form').on('submit', async function(e) {
            e.preventDefault();
            const name = $('#name').val();
            try {
                const formData = new FormData();
                formData.append('name', name);
                const response = await fetch(
                    `<?php echo esc_url_raw(rest_url('wbatwp/v1/hello')); ?>`,
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
                    $('#name').val('');
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