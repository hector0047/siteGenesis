package com.demandware.ant;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

import com.demandware.util.StringEncrypter;

public class DecryptTask extends Task {

    private String input;
    private String property;
    
    public void execute() throws BuildException {
        
        String keyPath = getProject().getProperty("local.build.temp") + "/build.des";
        String encrypted = input.replace(getProject().getProperty("encrypted_prefix"), "");
        StringEncrypter stringEncrypter = new StringEncrypter(keyPath, encrypted);
        String decrypted = stringEncrypter.decrypt();
        getProject().setProperty(property, decrypted);
    
    }

    public void setInput(final String input) {
        this.input = input;
    }

    public void setProperty(final String property) {
        this.property = property;
    }
    
}

