/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
const awscrt = require('aws-crt');
const iot = awscrt.iot;
const iotsdk = require('aws-iot-device-sdk-v2');
const mqtt = iotsdk.mqtt;
const TextDecoder = require('util').TextDecoder;

// FILL THESE FILE PATHS IN
const endpoint = "";
const topic = "temps";
const ca_file = "";
const cert = "";
const key = "";

async function execute_session(connection, argv) {
    return new Promise(async (resolve, reject) => {
        try {
            const decoder = new TextDecoder('utf8');
            const on_publish = async (topic, payload, dup, qos, retain) => {
                const json = decoder.decode(payload);
                console.log(`Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`);
                console.log(json);
                const message = JSON.parse(json);
                // const tempElement = document.getElementById("content").innerHTML = "F"
                if (message.sequence == argv.count) {
                    resolve();
                }
            }

            await connection.subscribe(argv.topic, mqtt.QoS.AtLeastOnce, on_publish);

        }
        catch (error) {
            reject(error);
        }
    });
}

 
/*
 * Build a direct mqtt connection using mtls, (http) proxy optional
 */
function build_direct_mqtt_connection_from_args(argv) {
    let config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(argv.cert, argv.key);

    if (argv.ca_file != null) {
        config_builder.with_certificate_authority_from_path(undefined, argv.ca_file);
    }

    config_builder.with_clean_session(false);
    config_builder.with_client_id(argv.client_id || "test-" + Math.floor(Math.random() * 100000000));
    config_builder.with_endpoint(argv.endpoint);
    const config = config_builder.build();

    const client = new mqtt.MqttClient();
    return client.new_connection(config);
}

async function startTemps() {

    const argv = {
        "endpoint": endpoint,
        "topic": topic,
        "ca_file": ca_file,
        "key": key,
        "cert": cert,
    };

    // console.log(argv);

    const connection = build_direct_mqtt_connection_from_args(argv);

    // force node to wait 60 seconds before killing itself, promises do not keep node alive
    // ToDo: we can get rid of this but it requires a refactor of the native connection binding that includes
    //    pinning the libuv event loop while the connection is active or potentially active.
    const timer = setInterval(() => {}, 60 * 1000);

    await connection.connect();
    while(true) {
        await execute_session(connection, argv);
    }
    
    await connection.disconnect();

    // Allow node to die if the promise above resolved
    clearTimeout(timer);
}

startTemps();