package com.demandware.ant; 

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

import com.demandware.util.StringEncrypter;

public class EncryptTask extends Task {

    private String input;
    private String property;
    
    public void execute() throws BuildException {
        
        String encryptedPrefix = getProject().getProperty("encrypted_prefix");
        Pattern regex = Pattern.compile("^" + encryptedPrefix);
        Matcher regexMatcher = regex.matcher(input);

        // dont't encrypt if string has been encrypted already
        if (!regexMatcher.find()) {
            String keyPath = getProject().getProperty("local.build.temp") + "/build.des";
            StringEncrypter stringEncrypter = new StringEncrypter(keyPath, input);
            String encrypted = stringEncrypter.encrypt();
            getProject().setProperty(property, encrypted);
        }
        
    }

    public void setInput(final String input) {
        this.input = input;
    }

    public void setProperty(final String property) {
        this.property = property;
    }
 
}
