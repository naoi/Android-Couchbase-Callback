## Android Couchbase PhotoShare デモアプリ

このアプリケーションは <a href="https://github.com/couchbaselabs/Android-Couchbase-Callback">Android-Couchbase-Callback</a> を使った家族間写真共有アプリケーションです。
対象端末は Android タブレットです。Samsung Galaxy Tab 10.1 でしか動作確認済みです（Android OS 3.1, 画面サイズ 1280 x 800）。

## はじめに

 以下の手順のコマンドを実行するためにインストールを済ませておくソフトウェアは次の通りになります。
    
  - <a href="http://ant.apache.org/">Ant</a> 1.8.2 以上 （Android プロジェクトのビルドに必要）
  - <a href="http://couchapp.org/">couchApp</a> 0.7.5 以上 （CouchApp を Couchbase Mobile に転送するのに必要）
  - <a href="http://python.org/">Python</a> 2.7.2 以上 （CouchApp を実行するのに必要）
  - <a href="http://curl.haxx.se/">cURL</a> 7.21.6 以上 （CouchDB にアクセスするのに必要） 
    
1.　このリポジトリのクローンを作成する。

2.  プロジェクトフォルダ内に Android SDK のパスを指した local.properties を作成する。

    sdk.dir=...

3.  コマンドラインツール、または eclipse を使用してアプリケーションをビルドする。

    ant debug

4.  デバイスまたはエミュレータへアプリケーションインストールした後、起動する。

    adb install bin/PhotoShare-debug.apk

    adb shell am start -n com.docomoinnovations.couchbase.photoshare/.PhotoShare

5.  デバイスから Couchbase Mobile が起動します。 デバイスの画面に CouchApp のインストール手順が表示されます。

6.  デバイスの画面に表示されている動的な TCP ポート番号を使って、デバイスで動作している Couchbase Mobile と接続する。

    adb forward tcp:8984 tcp:&lt;value displayed on your screen&gt;

7.  PhotoShareをCouchbase Mobile へインストールするには次のコマンドを実行する。

    cd photoshare

    couchapp push http://localhost:8984/photoshare

8.  次のコマンドで CouchApp のデータベースを圧縮する（任意）。

    curl -X POST -H "Content-Type: application/json"  http://localhost:8984/photoshare/_compact

9.  デバイスから Couchbase Mobile のデータベースをコピーする。コピーしたデータベースは Android プロジェクトの assets ディレクトリのルートに配置する。

    adb pull /mnt/sdcard/Android/data/com.docomoinnovations.couchbase.photoshare/db/photoshare.couch assets

10.  データベースをプロジェクトに含めたらアプリケーションをリパッケージングする。

    ant debug

11.  アプリケーションをアンインストール後、再インストールして起動する。

    adb uninstall com.docomoinnovations.couchbase.photoshare

    adb install bin/PhotoShare-debug.apk

    adb shell am start -n com.docomoinnovations.couchbase.photoshare/.PhotoShare

## 注意事項

このデモアプリでは、アプリケーション開始時に設定する必要があるオプションの数を減らすためにいくつかの前提条件があります。これらは、コードを変更することによって変更することが可能です。

-  ひとつの例として、データベースの名前は変更することができます（上記の例では couchapp 使用）。しかし、デザインドキュメントのアプリケーション名と同じにする必要があります。
　　 デザインドキュメントは生成した CouchApp プロジェクトディレクトリ内の couchapp.json ファイルです。
    
## さらにカスタマイズする場合

-  アプリケーションの名前とパッケージを変更する。
-  独自のカスタムのスプラッシュ画面を提供する（Android OS 3.0 以降では起動画面が表示されず異常終了します）。
-  build.xml のプロジェクトネームの変更
-  assets/www/couchapp.html の 22行目のパッケージ名の変更（TCP ポートの表示）

## ライセンス

Portions under Apache, Erlang, and other licenses.

The overall package is released under the Apache license, 2.0.

Copyright 2011-2012, DOCOMO Innovations, Inc.
