# LXDAO Suri

LXDAO Suri 是一个公开的链接缩短服务，任何人都可以提交请求来生成和管理自己的短链接。所有的短链接将由仓库管理员统一管理，并更新到 `suri/src/links.json` 文件中。

## 项目简介

Suri 是一个无需服务器托管、无服务器云函数或数据库的链接缩短工具。LXDAO Suri 可以快速部署到 Vercel、Netlify 等平台，帮助用户管理和简短链接。

## 如何使用 LXDAO 短链接服务

### 提交短链接请求

如果你希望使用 LXDAO 的短链接服务，请按照以下格式发送你的请求。我们将会审核并将有效的请求更新到 `suri/src/links.json` 文件中。

### 请求格式

请将以下信息发送到指定的联系邮箱：

- 短链接路径（Key）：例如 `/meetingA`
- 目标 URL（Value）：例如 `https://zoom.us/j/meetingA_id`

示例请求：

```json
{
  "shortlink": "/meetingA",
  "url": "https://zoom.us/j/meetingA_id"
}
```

### 联系方式

请将你的短链接请求发送至以下邮箱：

- 邮箱地址：official@lxdao.io

我们的管理员会尽快处理你的请求，并在确认后将你的短链接添加到系统中。

### 管理链接

管理员将通过以下路径管理所有短链接：

`src/links.json`

链接的示例格式如下：

```json
{
  "/": "https://github.com/lxdao-official/suri/blob/master/src/links.json",
  "opw": "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_MTJhMTY0ZTMtYzUyYS00Y2U2LThlZDUtNmU5MzRiZGRlZWUy%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%252233c37896-a852-458d-a347-2490bf4e6a9c%2522%252c%2522Oid%2522%253a%2522f3a85524-298d-4a59-8c92-4e83f89f84a0%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=10fdc731-3757-4330-8328-0a7346dcb2da&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true",
  "tw": "https://twitter.com/LXDAO_Official",
  "rw": "https://meeting.tencent.com/dm/l59WU3uZyKIP",
  "efw": "https://meeting.tencent.com/dm/fA6aRc3FNCF9",
  "fgw": "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_NmEzMGVmNzktMmQ3Yy00YzA4LWFjYjktMWYxYzAzYmUwMDY5%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%252233c37896-a852-458d-a347-2490bf4e6a9c%2522%252c%2522Oid%2522%253a%2522f3a85524-298d-4a59-8c92-4e83f89f84a0%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=365bd0d3-5ede-4a2c-8b57-6c055aa9b1e3&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true",
  "CC": "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_MGI4YTM4MTUtMTcyZC00MzQ3LTk4MzItZWRmMzBlNTRlZTUx%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%252233c37896-a852-458d-a347-2490bf4e6a9c%2522%252c%2522Oid%2522%253a%2522f3a85524-298d-4a59-8c92-4e83f89f84a0%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=c94333d6-db75-4e57-a1d3-216524336687&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true",
  "OPCN": "https://meeting.tencent.com/dm/Ovnau54PyP3a",
  "govw": "https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_ODhhZjA3Y2UtNzMxOC00NjFhLWFhMjEtN2U3OWRjN2NkZDgx%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%252233c37896-a852-458d-a347-2490bf4e6a9c%2522%252c%2522Oid%2522%253a%2522f3a85524-298d-4a59-8c92-4e83f89f84a0%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=63ef5241-0481-4ece-b207-92fe909f2099&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true"
}
```
