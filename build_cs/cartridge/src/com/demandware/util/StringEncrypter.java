package com.demandware.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import com.demandware.crypto.DesEncrypter;

public class StringEncrypter {
    
    private String keyPath;
    private String encString;
    
    public static void main(String[] args) {
        
        String keyPath = args[0];
        String encString = args[1];
        
        StringEncrypter stringEncrypter = new StringEncrypter(keyPath, encString);

        if (args[2].equals("encrypt")) {  
            stringEncrypter.encrypt();
        }
        else if (args[2].equals("decrypt")) {
            stringEncrypter.decrypt();
        }
    }
    
    public StringEncrypter(String keyPath, String encString) {
        this.keyPath = keyPath;
        this.encString = encString;
    }

    public String encrypt() {
        
        String encrypted = new String();
        
        try {
            SecretKey key;
            File keyFile = new File(keyPath);
            
            if (!keyFile.exists()) {     
                key = KeyGenerator.getInstance("DES").generateKey();
                saveKeyToFile(key, keyPath);    
            }
            else {
                key = getKeyFromFile(keyPath);
            }
            
            DesEncrypter encrypter = new DesEncrypter(key);
            encrypted = encrypter.encrypt(encString); 
        }
        catch (Exception e) {
        }
        
        return encrypted;
    }
    
    public String decrypt() {
        
        String decrypted = new String();
        
        try { 
            SecretKey key = getKeyFromFile(keyPath);
            DesEncrypter encrypter = new DesEncrypter(key);
            decrypted = encrypter.decrypt(encString); 
        }
        catch (Exception e) {
        }
        
        return decrypted;
    }
    
    private static void saveKeyToFile(SecretKey key, String keyPath) throws FileNotFoundException, IOException {
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(keyPath));
        oos.writeObject(key);
        oos.close();
    }
    
    private static SecretKey getKeyFromFile(String keyPath) throws IOException, ClassNotFoundException {
        SecretKey key = null;
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(keyPath));
        key = (SecretKey) ois.readObject();
        ois.close();
        return key;
    }

}
