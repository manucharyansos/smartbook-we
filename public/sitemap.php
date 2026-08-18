<?php
$apiBase = rtrim(getenv('VIZIT_API_URL') ?: getenv('VITE_API_URL') ?: 'https://api.vizit.am/api', '/');
$url = $apiBase . '/public/seo/sitemap.xml';
$context = stream_context_create(['http' => ['timeout' => 3.0, 'ignore_errors' => true, 'header' => "Accept: application/xml\r\n"]]);
$xml = @file_get_contents($url, false, $context);
if (!$xml || strpos($xml, '<urlset') === false) {
    $staticPaths = [
        ['/', '1.0'],
        ['/features', '0.8'],
        ['/pricing', '0.8'],
        ['/about', '0.7'],
        ['/contact', '0.7'],
        ['/support', '0.6'],
        ['/faq', '0.6'],
        ['/privacy-policy', '0.4'],
        ['/terms', '0.4'],
        ['/cookies', '0.4'],
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
