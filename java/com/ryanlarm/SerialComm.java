package com.ryanlarm;

/**
 * Serial Communication object, wrapper around JSSC SerialPort
 * from CSE132, used to receive byte array from selected Serial
 * Port.
 */

import jssc.SerialPort;
import jssc.SerialPortException;

public class SerialComm {
    SerialPort port;

    public SerialComm(String com) throws SerialPortException {
        port = new SerialPort(com);
        port.openPort();
        port.setParams(
                SerialPort.BAUDRATE_9600,
                SerialPort.DATABITS_8,
                SerialPort.STOPBITS_1,
                SerialPort.PARITY_NONE
        );
    }

    public boolean available() throws SerialPortException {
        return (port.getInputBufferBytesCount() > 0) ? true : false;
    }

    public byte[] readByte() throws SerialPortException {
        return port.readBytes();
    }
}

