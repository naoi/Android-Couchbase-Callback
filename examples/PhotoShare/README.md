## Android Couchbase PhotoShare

This application allows you to share Photos by using <a href="https://github.com/couchbaselabs/Android-Couchbase-Callback">Android-Couchbase-CallBack</a>
The target device is Android tablet. We only tested with Samsung Galaxy Tab 10.1 (Android OS 3.1, 1280 x 800 screen resolution).

## Getting Started

   installed software to run the command is as follows.

   - <a href="http://ant.apache.org/">Ant</a> 1.8.2 or higher (to Build Android Project)
   - <a href="http://couchapp.org/">couchApp</a> 0.7.5 or higher (to transfer CouchApp to Couchbase Mobile)
   - <a href="http://python.org/">Python</a> 2.7.2 or higher (to run CouchApp )
   - <a href="http://curl.haxx.se/">cURL</a> 7.21.6 or higher (to Access CouchDB) 
    
1.  Clone this repository

2.  Create a local.properties pointing to your Android SDK

    sdk.dir=...

3.  Build this application, either using eclipse or command line tools

    ant debug

4.  Install/Launch this application on your device/emulator

    adb install bin/PhotoShare-debug.apk

    adb shell am start -n com.docomoinnovations.couchbase.photoshare/.PhotoShare

5.  Couchbase Mobile is now running, you should see now see instructions on screen install your CouchApp.

6.  Forward the Couchbase Mobile from the device to your development machine (the Couchbase port is dynamic and is shown on the screen)

    adb forward tcp:8984 tcp:&lt;value displayed on your screen&gt;
    
7.  From within your CouchApp project directory, run the following command to install your PhotoShare on the device.

    cd photoshare

    couchapp push http://localhost:8984/photoshare

8.  Compact your database

    curl -X POST -H "Content-Type: application/json"  http://localhost:8984/photoshare/_compact

9.  Copy the database off the device and into this Android application's assets directory:

    adb pull /mnt/sdcard/Android/data/com.docomoinnovations.couchbase.photoshare/db/photoshare.couch assets

10.  Repackage your application with the database file included

    ant debug

11.  Reinstall the application to launch the CouchApp

    adb uninstall com.docomoinnovations.couchbase.photoshare

    adb install bin/PhotoShare-debug.apk

    adb shell am start -n com.docomoinnovations.couchbase.photoshare/.PhotoShare

## Assumptions

A few assumptions are currently made to reduce the number of options that must be configured to get started.  Currently these can only be changed by modifying the code.

-  The name of the database can be anything (couchapp is used in the examples above).  BUT, the design document must have the same name.
   The design document is couchapp.json generated couchapp directory.
    
## Further Customizations

-  Change the name and package of your application
-  Provide your own custom splash screen( may not be displayed and end up your application  abnormally on Android OS 3.0)
-  Change the project name in the build.xml
-  Changing the package name in line 22 assets/www/couchapp.html(Display the TCP port)

## License

Portions under Apache, Erlang, and other licenses.

The overall package is released under the Apache license, 2.0.

Copyright 2011-2012 DOCOMO Innovations, Inc.
