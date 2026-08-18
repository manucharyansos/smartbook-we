<?php
$apiBase = rtrim(getenv('VIZIT_API_URL') ?: getenv('VITE_API_URL') ?: 'https://api.vizit.am/api', '/');
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if ($path !== '/') $path = rtrim($path, '/') ?: '/';
$indexFile = __DIR__ . '/index.html';
$html = is_file($indexFile) ? file_get_contents($indexFile) : '';

function vizit_h($value) { return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function vizit_default_meta($path) {
    $url = 'https://vizit.am' . ($path === '/' ? '/' : $path);
    $pages = [
        '/' => ['Vizit.am — օնլայն ամրագրում ծառայությունների և բժշկական այցերի համար', 'Գտեք ծառայություններն ու բժշկական կենտրոնները, ընտրեք բիզնեսը և ամրագրեք ազատ ժամը Vizit.am-ում։'],
        '/features' => ['Vizit-ի հնարավորությունները բիզնեսների համար', 'Կառավարեք ամրագրումները, օրացույցը, ծառայությունները, թիմը և հաճախորդներին մեկ հարթակում։'],
        '/pricing' => ['Vizit-ի գնային պլանները', 'Ընտրեք ձեր բիզնեսի չափին համապատասխան Vizit պլանը և սկսեք 14-օրյա փորձաշրջանը։'],
        '/about' => ['Vizit-ի մասին', 'Ծանոթացեք Vizit.am օնլայն ամրագրման հարթակին և մեր նպատակին։'],
        '/contact' => ['Կապ Vizit-ի թիմի հետ', 'Գրեք կամ զանգահարեք Vizit-ի թիմին համագործակցության, միացման և այլ հարցերով։'],
        '/support' => ['Vizit աջակցություն', 'Ստացեք օգնություն Vizit-ի կարգավորումների, վճարումների և ամրագրման հոսքերի վերաբերյալ։'],
        '/faq' => ['Հաճախ տրվող հարցեր | Vizit', 'Vizit.am-ի գրանցման, ամրագրումների, պլանների և աշխատանքի մասին հաճախ տրվող հարցերի պատասխաններ։'],
        '/privacy-policy' => ['Գաղտնիության քաղաքականություն | Vizit', 'Կարդացեք Vizit-ի գաղտնիության քաղաքականությունը։'],
        '/terms' => ['Օգտագործման պայմաններ | Vizit', 'Կարդացեք Vizit հարթակի օգտագործման պայմանները։'],
        '/cookies' => ['Cookie-ների քաղաքականություն | Vizit', 'Իմացեք, թե ինչպես է Vizit-ը օգտագործում cookie-ները։'],
    ];
    $page = $pages[$path] ?? null;
    $isKnownRoute = $page !== null;
    $privatePrefixes = ['/login', '/register', '/forgot-password', '/reset-password', '/business/', '/client/', '/admin', '/app', '/payment-return', '/auth/', '/mock-bank'];
    $robots = $isKnownRoute ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
    foreach ($privatePrefixes as $prefix) {
        if ($path === rtrim($prefix, '/') || strpos($path, $prefix) === 0) {
            $robots = 'noindex,nofollow';
            $isKnownRoute = true;
            break;
        }
    }
    if (in_array($path, ['/blog', '/careers', '/press'], true)) {
        $robots = 'noindex,follow';
        $isKnownRoute = true;
    }
    if (preg_match('#^/(businesses|book)/[^/]+$#', $path)) {
        // The API normally verifies these routes. If it is temporarily
        // unavailable, keep the SPA reachable but do not index fallback data.
        $isKnownRoute = true;
    }

    return [
        'title' => $page[0] ?? 'Vizit — օնլայն ամրագրում սրահների ու կլինիկաների համար',
        'description' => $page[1] ?? 'Vizit-ը օնլայն ամրագրման համակարգ է գեղեցկության սրահների, կլինիկաների և ծառայություն մատուցող բիզնեսների համար Հայաստանում։',
        'image' => 'https://vizit.am/og-default.svg',
        'url' => $url,
        'canonical' => $url,
        'site_name' => 'Vizit',
        'type' => 'website',
        'locale' => 'hy_AM',
        'robots' => $robots,
        'twitter_card' => 'summary_large_image',
        'json_ld' => null,
        'status' => $isKnownRoute ? 200 : 404,
    ];
}
function vizit_fetch_meta($apiBase, $path) {
    $url = $apiBase . '/public/seo/meta?path=' . rawurlencode($path);
    $context = stream_context_create(['http' => ['timeout' => 2.2, 'ignore_errors' => true, 'header' => "Accept: application/json\r\n"]]);
    $body = @file_get_contents($url, false, $context);
    if (!$body) return null;
    $data = json_decode($body, true);
    if (!is_array($data) || empty($data['title']) || empty($data['description']) || empty($data['url']) || empty($data['image'])) {
        return null;
    }
    return $data;
}
function vizit_tags($meta) {
    $json = '';
    if (!empty($meta['json_ld']) && is_array($meta['json_ld'])) {
        $jsonFlags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
        $json = "\n    <script type=\"application/ld+json\">" . json_encode($meta['json_ld'], $jsonFlags) . "</script>";
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
if ((int) ($meta['status'] ?? 200) === 404) {
    http_response_code(404);
}
header('Content-Type: text/html; charset=UTF-8');
echo $html;
