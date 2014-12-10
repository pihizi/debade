<?php

namespace RedisMQ;

class Publisher
{
    private $_redis;
    private $_asyncChannel;
    public function __construct($host='127.0.0.1', $port='6379', $password=null, $channel='debade')
    {
        $redis = new \Redis();
        $redis->connect($host, $port);
        if (!empty($password)) {
            $redis->auth($password);
        }
        $this->_redis = $redis;
        $this->_asyncChannel = $channel;
    }

    public function __destruct()
    {
        $this->_redis->close();
    }

    public function send($channel, $message, $type='message')
    {
        $message = json_encode([
            'channel'=> $channel,
            'type'=> $type,
            'content'=> [
                'data'=> $message,
                'time'=> microtime()
            ]
        ]);
        return $this->_redis->publish($this->_asyncChannel, $message);
    }
}
