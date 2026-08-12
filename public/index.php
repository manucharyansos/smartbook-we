<?php
$apiBase = rtrim(getenv('VIZIT_API_URL') ?: getenv('VITE_API_URL') ?: 'https://api.vizit.am/api', '/');
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$indexFile = __DIR__ . '/index.html';
$html = is_file($indexFile) ? file_get_contents($indexFile) : '';

function vizit_h($value) { return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function vizit_default_meta($path) {
    $url = 'https://vizit.am' . ($path === '/' ? '/' : $path);
    return [
        'title' => 'Vizit — օնլայն ամրագրում սրահների ու կլինիկաների համար',
        'description' => 'Vizit-ը օնլայն ամրագրման համակարգ է գեղեցկության սրահների, կլինիկաների և ծառայություն մատուցող բիզնեսների համար Հայաստանում։',
        'image' => 'https://vizit.am/og-default.svg',
        'url' => $url,
        'canonical' => $url,
        'site_name' => 'Vizit',
        'type' => 'website',
        'locale' => 'hy_AM',
        'robots' => 'index,follow,max-image-preview:large',
        'twitter_card' => 'summary_large_image',
        'json_ld' => null,
    ];
}
function vizit_fetch_meta($apiBase, $path) {
    $url = $apiBase . '/public/seo/meta?path=' . rawurlencode($path);
    $context = stream_context_create(['http' => ['timeout' => 2.2, 'ignore_errors' => true, 'header' => "Accept: application/json\r\n"]]);
    $body = @file_get_contents($url, false, $context);
    if (!$body) return null;
    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}
function vizit_tags($meta) {
    $json = '';
    if (!empty($meta['json_ld']) && is_array($meta['json_ld'])) {
        $json = "\n    <script type=\"application/ld+json\">" . json_encode($meta['json_ld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "</script>";
    }
    return '<!--VIZIT_DYNAMIC_SEO_START-->' . "\n" .
        '    <title>' . vizit_h($meta['title']) . "</title>\n" .
        '    <meta name="description" content="' . vizit_h($meta['description']) . '" />' . "\n" .
        '    <meta name="robots" content="' . vizit_h($meta['robots'] ?? 'index,follow,max-image-preview:large') . '" />' . "\n" .
        '    <link rel="canonical" href="' . vizit_h($meta['canonical'] ?? $meta['url']) . '" />' . "\n" .
        '    <meta property="og:locale" content="' . vizit_h($meta['locale'] ?? 'hy_AM') . '" />' . "\n" .
        '    <meta property="og:site_name" content="' . vizit_h($meta['site_name'] ?? 'Vizit') . '" />' . "\n" .
        '    <meta property="og:type" content="' . vizit_h($meta['type'] ?? 'website') . '" />' . "\n" .
        '    <meta property="og:title" content="' . vizit_h($meta['title']) . '" />' . "\n" .
        '    <meta property="og:description" content="' . vizit_h($meta['description']) . '" />' . "\n" .
        '    <meta property="og:image" content="' . vizit_h($meta['image']) . '" />' . "\n" .
        '    <meta property="og:url" content="' . vizit_h($meta['url']) . '" />' . "\n" .
        '    <meta name="twitter:card" content="' . vizit_h($meta['twitter_card'] ?? 'summary_large_image') . '" />' . "\n" .
        '    <meta name="twitter:title" content="' . vizit_h($meta['title']) . '" />' . "\n" .
        '    <meta name="twitter:description" content="' . vizit_h($meta['description']) . '" />' . "\n" .
        '    <meta name="twitter:image" content="' . vizit_h($meta['image']) . '" />' .
        $json . "\n" .
        '    <!--VIZIT_DYNAMIC_SEO_END-->';
}

$meta = vizit_fetch_meta($apiBase, $path) ?: vizit_default_meta($path);
$tags = vizit_tags($meta);
$html = preg_replace('/<!--VIZIT_DYNAMIC_SEO_START-->.*?<!--VIZIT_DYNAMIC_SEO_END-->/s', $tags, $html, 1) ?: $html;
header('Content-Type: text/html; charset=UTF-8');
echo $html;
