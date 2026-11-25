#!/usr/bin/env bash
set -euo pipefail

project="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
platform="${ANDROID_PLATFORM_JAR:-$sdk/platforms/android-35/android.jar}"
tools="${ANDROID_BUILD_TOOLS:-$sdk/build-tools/35.0.0}"
output="${1:-$project/build/TradingViewBTC.apk}"
key="${APK_DEBUG_KEYSTORE:-$HOME/.android/debug.keystore}"

build="$(mktemp -d)"
trap 'rm -rf "$build"' EXIT
mkdir -p "$build/classes" "$build/dex" "$(dirname "$output")" "$(dirname "$key")"
main="$project/app/src/main"

"$tools/aapt2" compile --dir "$main/res" -o "$build/resources.zip"
"$tools/aapt2" link -o "$build/resources.apk" -I "$platform" \
  --manifest "$main/AndroidManifest.xml" --min-sdk-version 26 --target-sdk-version 35 \
  --version-code 5 --version-name 1.3.0 -A "$main/assets" "$build/resources.zip"

# Match the Gradle dependencies for the native Bitstamp alert.
dependency_dir="${APP_DEPENDENCY_DIR:-$build/dependencies}"
mkdir -p "$dependency_dir"
maven="https://repo.maven.apache.org/maven2"
fetch_dependency() {
  local coordinate="$1" expected="$2"
  local jar="$dependency_dir/${coordinate##*/}"
  if [[ ! -f "$jar" ]]; then
    curl -fsSL --retry 2 --max-time 30 "$maven/$coordinate" -o "$build/${coordinate##*/}"
    printf '%s  %s\n' "$expected" "$build/${coordinate##*/}" | sha256sum -c - >&2
    mv "$build/${coordinate##*/}" "$jar"
  fi
  printf '%s  %s\n' "$expected" "$jar" | sha256sum -c - >&2
  printf '%s\n' "$jar"
}
websocket="$(fetch_dependency org/java-websocket/Java-WebSocket/1.6.0/Java-WebSocket-1.6.0.jar \
  eae29213e4f16515639c28957200f011b3967fffcada1962cf0255d24919c22f)"
slf4j="$(fetch_dependency org/slf4j/slf4j-api/2.0.16/slf4j-api-2.0.16.jar \
  a12578dde1ba00bd9b816d388a0b879928d00bab3c83c240f7013bf4196c579a)"

mapfile -d '' sources < <(find "$main/java" -name '*.java' -print0)
if [[ -n "${ECJ_JAR:-}" ]]; then
  java -jar "$ECJ_JAR" -source 8 -target 8 -warn:+deprecation \
    -bootclasspath "$platform:$tools/core-lambda-stubs.jar" -classpath "$websocket:$slf4j" -d "$build/classes" "${sources[@]}"
else
  javac -source 8 -target 8 -bootclasspath "$platform:$tools/core-lambda-stubs.jar" -classpath "$websocket:$slf4j" -d "$build/classes" "${sources[@]}"
fi
(cd "$build/classes" && zip -qr "$build/classes.jar" .)
"$tools/d8" --min-api 26 --lib "$platform" --output "$build/dex" "$build/classes.jar" "$websocket" "$slf4j"
(cd "$build/dex" && zip -q "$build/resources.apk" classes.dex)
"$tools/zipalign" -p -f 4 "$build/resources.apk" "$build/aligned.apk"

if [[ ! -e "$key" ]]; then
  keytool -genkeypair -keystore "$key" -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US"
fi
"$tools/apksigner" sign --ks "$key" --ks-key-alias androiddebugkey \
  --ks-pass pass:android --key-pass pass:android --out "$output" "$build/aligned.apk"
"$tools/apksigner" verify "$output"
