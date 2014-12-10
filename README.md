### DeBaDe 环境搭建

#### 服务器搭建

1. rabbitMQ 服务器

        docker pull pihizi/rabbitmq
        docker run --name debade-rabbitmq \
            --restart always \
            --dns 172.17.42.1 \
            -v /dev/log:/dev/log \
            -p 5672:5672 \
            -p 15672:15672 \
            -d pihizi/rabbitmq

2. redis 服务器

        docker pull pihizi/redis
        docker run --name debade-redis \
            --restart always \
            --dns 172.17.42.1 \
            -v /dev/log:/dev/log \
            -p 6379:6379 \
            -d pihizi/redis

3. agent 服务器

        docker pull pihizi/debade-agent:0.1.0
        docker run --name debade-agent \
            --restart always \
            --dns 172.17.42.1 \
            -v /dev/log:/dev/log \
            -v /etc/lib/debade:/etc/lib/debade \
            -p 80:80 \
            -d pihizi/debade-agent:0.1.0

4. master 服务器

        docker pull pihizi/debade-master:0.1.0
        docker run --name debade-master \
            --restart always \
            --dns 172.17.42.1 \
            -v /dev/log:/dev/log \
            -d pihizi/debade-master:0.1.0

#### DNS服务器配置

1. 在`172.17.42.1`安装`dnsmasq`, 并在`/etc/dnsmasq.d/debade`文件中增加以下记录

        address=/rabbitmq.debade/DOCKER-debade-rabbitmq-IP
        address=/redis.debade/DOCKER-debade-redis-IP
        address=/agent.debade/DOCKER-debade-agent-IP
        address=/master.debade/DOCKER-debade-master-IP

    * 如果以上四个服务器均属同一台宿主机，可以通过dnsmasq.refresh完成dns纪录的添加

#### 测试

1. 向agent服务器注册消息回调事件
    * 安装debade-callback `npm install -g debade-callback`
    * 运行`debade-callback`, 并根据提示输入以下信息
        * RabbitMQ Channel: `my-test-rabbitmq-channel`
        * Callback Type: `http-jsonrpc`
        * Callback URL: `http://YOUR-URL:PORT/PATH`
        * Callback Token: `TOKEN`
        * Register to Debade Agent: `http://agent.debade/register`

2. php demo

        "require": {
            "pihizi/redismq-php-publisher": "dev-master"
        }

        php php-demo/index.php

