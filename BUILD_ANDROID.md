# StockTracker Android App 构建指南

## 版本信息

- **应用名称**: StockTracker
- **应用ID**: com.stocktracker.app
- **版本号**: 2.1.0
- **最小SDK**: 24 (Android 7.0)
- **目标SDK**: 34 (Android 14)

## 使用GitHub Actions自动构建

### 前置要求

1. **GitHub仓库**: 将代码推送到GitHub
2. **GitHub Secrets**: 配置以下密钥（可选，用于发布版本）
   - `KEYSTORE_FILE`: Base64编码的keystore文件
   - `KEYSTORE_PASSWORD`: Keystore密码
   - `KEY_ALIAS`: 密钥别名
   - `KEY_PASSWORD`: 密钥密码

### 自动构建流程

#### 方式1：推送到main分支自动构建

```bash
git push origin main
```

GitHub Actions会自动触发构建，生成Debug APK。

#### 方式2：手动触发构建

1. 进入GitHub仓库
2. 点击 `Actions` 标签
3. 选择 `Build Android APK` 工作流
4. 点击 `Run workflow`
5. 选择构建类型（debug/release）
6. 点击 `Run workflow`

#### 方式3：通过标签发布

```bash
git tag v2.1.0
git push origin v2.1.0
```

GitHub Actions会自动构建并创建Release。

### 获取构建产物

1. **Debug APK**
   - 进入GitHub仓库 → `Actions`
   - 选择最新的构建任务
   - 下载 `android-apk` 工件

2. **Release APK/AAB**
   - 进入GitHub仓库 → `Releases`
   - 下载对应版本的APK或AAB文件

## 本地构建（可选）

### 前置要求

- Node.js 22+
- pnpm
- Java 17+
- Android SDK (API 34)
- Gradle 8.0+

### 构建步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 构建Web应用
pnpm build

# 3. 添加Android平台
pnpm exec cap add android

# 4. 构建APK
cd android
./gradlew assembleDebug

# 5. 构建Release版本（需要签名密钥）
./gradlew assembleRelease
```

### 生成签名密钥

```bash
# 生成keystore文件
keytool -genkey -v -keystore stocktracker.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias stocktracker

# 将keystore转换为Base64（用于GitHub Secrets）
base64 stocktracker.jks > keystore.base64
```

## 配置GitHub Secrets

1. 进入GitHub仓库 → `Settings` → `Secrets and variables` → `Actions`
2. 创建以下Secrets：

```
KEYSTORE_FILE: [Base64编码的keystore文件内容]
KEYSTORE_PASSWORD: [keystore密码]
KEY_ALIAS: stocktracker
KEY_PASSWORD: [密钥密码]
```

## APK安装

### 通过ADB安装

```bash
adb install app-debug.apk
```

### 通过手机直接安装

1. 将APK文件传输到手机
2. 打开文件管理器，找到APK文件
3. 点击安装

## 故障排除

### 构建失败

1. **Java版本错误**
   - 确保使用Java 17+
   - `java -version`

2. **Android SDK缺失**
   - 在GitHub Actions中自动安装
   - 本地需要手动安装Android SDK

3. **Gradle缓存问题**
   - 清除缓存: `./gradlew clean`
   - 重新构建: `./gradlew assembleDebug`

### APK无法安装

1. **设备不兼容**
   - 检查Android版本 (最低7.0)
   - 检查CPU架构 (ARM/x86)

2. **签名问题**
   - 确保使用相同的签名密钥
   - 卸载旧版本后重新安装

## 更新版本号

编辑 `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  version: '2.2.0', // 更新版本号
  // ...
};
```

编辑 `android/app/build.gradle.kts`:

```kotlin
versionCode = 2  // 增加构建版本
versionName = "2.2.0"  // 更新版本名称
```

## 发布到Google Play Store

1. 创建Google Play开发者账户
2. 生成Release APK/AAB
3. 在Google Play Console中创建应用
4. 上传APK/AAB文件
5. 填写应用信息和截图
6. 提交审核

## 相关文档

- [Capacitor官方文档](https://capacitorjs.com/docs)
- [Android开发指南](https://developer.android.com/docs)
- [GitHub Actions文档](https://docs.github.com/en/actions)
