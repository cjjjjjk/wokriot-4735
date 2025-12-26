plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.example.wokriot_app"
    
    // [QUAN TRỌNG] Phải sửa thành 34 để chạy được thư viện thông báo mới
    compileSdk = 36 
    
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
        isCoreLibraryDesugaringEnabled = true 
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    sourceSets {
        getByName("main").java.srcDirs("src/main/kotlin")
    }

    defaultConfig {
        applicationId = "com.example.wokriot_app"
        minSdk = flutter.minSdkVersion
        
        // [NÊN LÀM] Sửa thành 34 luôn cho đồng bộ
        targetSdk = 36 
        
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    // 👇👇 Dòng này của bạn đã đúng rồi
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.4")
}