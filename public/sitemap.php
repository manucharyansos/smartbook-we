<?php
$apiBase = rtrim(getenv('VIZIT_API_URL') ?: getenv('VITE_API_URL') ?: 'https://api.vizit.am/api', '/');
$url = $apiBase . '/public/seo/sitemap.xml';

// cURL first: many shared hosts disable allow_url_fopen, which left only the
// static list below (without /business and the business profile pages).
$xml = null;
if (function_exists('curl_init')) {
    $handle = curl_init($url);
    curl_setopt_array($handle, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 1,
        CURLOPT_TIMEOUT => 3,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HTTPHEADER => ['Accept: application/xml'],
    ]);
    $body = curl_exec($handle);
    curl_close($handle);
    if (is_string($body) && $body !== '') $xml = $body;
}
if (!$xml && filter_var(ini_get('allow_url_fopen'), FILTER_VALIDATE_BOOLEAN)) {
    $context = stream_context_create(['http' => ['timeout' => 3.0, 'ignore_errors' => true, 'header' => "Accept: application/xml\r\n"]]);
    $body = @file_get_contents($url, false, $context);
    if (is_string($body) && $body !== '') $xml = $body;
}

if (!$xml || strpos($xml, '<urlset') === false) {
    $staticPaths = [
        ['/', '1.0'],
        ['/business', '0.9'],
        ['/features', '0.8'],
        ['/pricing', '0.8'],
        ['/about', '0.7'],
        ['/contact', '0.7'],
        ['/support', '0.6'],
        ['/faq', '0.6'],
        ['/privacy-policy', '0.4'],
        ['/terms', '0.4'],
        ['/cookies', '0.4'],
        ['/refund-policy', '0.4'],
        ['/personal-data', '0.4'],
    ];
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($staticPaths as [$path, $priority]) {
        $xml .= '  <url><loc>https://vizit.am' . $path . '</loc><changefreq>weekly</changefreq><priority>' . $priority . '</priority></url>' . "\n";
    }
    $xml .= '</urlset>';
}
header('Content-Type: application/xml; charset=UTF-8');
echo $xml;
