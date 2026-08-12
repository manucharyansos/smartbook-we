<?php
$apiBase = rtrim(getenv('VIZIT_API_URL') ?: getenv('VITE_API_URL') ?: 'https://api.vizit.am/api', '/');
$url = $apiBase . '/public/seo/sitemap.xml';
$context = stream_context_create(['http' => ['timeout' => 3.0, 'ignore_errors' => true, 'header' => "Accept: application/xml\r\n"]]);
$xml = @file_get_contents($url, false, $context);
if (!$xml) {
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n" .
        '  <url><loc>https://vizit.am/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>' . "\n" .
        '</urlset>';
}
header('Content-Type: application/xml; charset=UTF-8');
echo $xml;
