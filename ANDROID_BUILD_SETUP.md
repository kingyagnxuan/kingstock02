# Android App 构建设置指南

## 快速开始

### 步骤1：推送代码到GitHub

```bash
git add .
git commit -m "Add Capacitor Android support"
git push origin main
```

### 步骤2：GitHub Actions自动构建

GitHub Actions会自动开始构建。您可以在以下位置查看构建进度：

- 进入GitHub仓库
- 点击 `Actions` 标签
- 查看 `Build Android APK` 工作流的运行状态

### 步骤3：下载APK

构建完成后，您可以：

1. **下载Debug APK**
   - 进入最新的构建任务
   - 下载 `android-apk` 工件
   - 这是一个Debug版本的APK，可用于测试

2. **创建Release版本**
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```
   - GitHub Actions会自动构建并创建Release
   - 在 `Releases` 页面下载APK

## 配置签名密钥（可选，用于发布版本）

### 生成签名密钥

如果您想发布Release版本到Google Play Store，需要生成签名密钥：

```bash
# 1. 生成keystore文件
keytool -genkey -v -keystore stocktracker.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias stocktracker

# 2. 将keystore转换为Base64
base64 stocktracker.jks | tr -d '\n' > keystore.base64

# 3. 查看Base64内容（用于GitHub Secrets）
cat keystore.base64
```

### 配置GitHub Secrets

1. 进入GitHub仓库
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret`
4. 创建以下4个Secrets：

| 名称 | 值 |
|------|-----|
| `KEYSTORE_FILE` | keystore.base64文件的内容 |
| `KEYSTORE_PASSWORD` | 生成keystore时设置的密码 |
| `KEY_ALIAS` | `stocktracker` |
| `KEY_PASSWORD` | 生成keystore时设置的密钥密码 |

### 示例

```bash
# 创建keystore
keytool -genkey -v -keystore stocktracker.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias stocktracker \
  -keypass myKeyPassword \
  -storepass myStorePassword \
  -dname "CN=StockTracker, O=StockTracker, L=Beijing, ST=Beijing, C=CN"

# 转换为Base64
base64 stocktracker.jks > keystore.base64

# 查看内容
cat keystore.base64
```

## 项目结构

```
stock-tracker/
├── .github/
│   └── workflows/
│       └── build-android.yml          # GitHub Actions工作流
├── android/                            # Capacitor生成的Android项目
│   ├── app/
│   │   └── build.gradle.kts           # Android构建配置
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   ├── gradlew
│   └── gradlew.bat
├── capacitor.config.ts                # Capacitor配置
├── BUILD_ANDROID.md                   # 构建详细指南
├── ANDROID_BUILD_SETUP.md             # 本文件
├── package.json
├── pnpm-lock.yaml
└── dist/                              # 构建输出目录
```

## 工作流说明

### build-android.yml 工作流

该工作流在以下情况下触发：

1. **自动触发**
   - 推送到 `main`、`master` 或 `develop` 分支
   - 创建新的Git标签

2. **手动触发**
   - 在GitHub Actions中手动运行工作流
   - 可选择Debug或Release构建类型

### 工作流步骤

1. 检出代码
2. 设置Node.js和pnpm
3. 安装依赖
4. 构建Web应用
5. 设置Java环境
6. 设置Android SDK
7. 添加Android平台到Capacitor
8. 构建APK
9. 上传工件到GitHub
10. 创建Release（如果是标签推送）

## 常见问题

### Q: 如何获取APK文件？

A: 构建完成后，进入GitHub Actions的构建任务，在页面下方找到 `Artifacts` 部分，下载 `android-apk`。

### Q: Debug版本和Release版本有什么区别？

A: 
- **Debug版本**: 用于测试，包含调试信息，可直接安装
- **Release版本**: 用于发布，需要签名密钥，文件更小

### Q: 如何更新版本号？

A: 编辑以下文件：
- `capacitor.config.ts`: 修改 `version` 字段
- `android/app/build.gradle.kts`: 修改 `versionCode` 和 `versionName`

### Q: 可以在本地构建吗？

A: 可以，但需要安装Android SDK和Java 17+。详见 `BUILD_ANDROID.md`。

## 下一步

1. ✅ 推送代码到GitHub
2. ✅ 等待GitHub Actions完成构建
3. ✅ 下载APK文件进行测试
4. ✅ （可选）生成签名密钥用于发布版本
5. ✅ （可选）上传到Google Play Store

## 支持

如有问题，请参考：
- [Capacitor官方文档](https://capacitorjs.com/docs)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Android开发指南](https://developer.android.com/docs)
