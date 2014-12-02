<?php

require_once(__DIR__ . 'vendor/autoload.php');

$client = new \RabbitMQ\Publisher($host);
$client->send('my-test-rabbitmq-channel', 'Test Message');
