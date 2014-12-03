<?php

require_once(__DIR__ . '/vendor/autoload.php');

$host = 'redis.debade';
$client = new \RedisMQ\Publisher($host);
$client->send('my-test-rabbitmq-channel', 'Test Message');
