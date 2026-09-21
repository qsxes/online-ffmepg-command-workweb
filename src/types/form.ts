export interface CompressForm{
    /**
     * 操作类型
     *
     * 压缩视频
     */
    operation: 'compress'
    /**
     * 视频编码器
     * 对应 FFmpeg 参数：-c:v
     *
     * libx264 = H.264，兼容性最好，手机、电视、浏览器、剪辑软件都认
     * libx265 = H.265，同画质下体积更小，但老设备、部分播放器可能不支持
     *
     * 用户看到的：一个下拉框，选项是「H.264（兼容性好）」「H.265（体积更小）」
     */
    codec: 'libx264' | 'libx265'

    /**
     * 画质（恒定质量因子，Constant Rate Factor）
     * 对应 FFmpeg 参数：-crf
     *
     * 数字越小 → 画质越好 → 文件越大
     * 数字越大 → 画质越差 → 文件越小
     *
     * 常用范围：
     * 18 = 接近无损，文件大
     * 23 = 默认，平衡
     * 28 = 压缩明显，文件小
     *
     * 用户看到的：一个滑块，范围 18–28，默认 23
     */
    crf: number

    /**
     * 编码速度预设
     * 对应 FFmpeg 参数：-preset
     *
     * 控制压缩时 CPU 花多少时间：
     * ultrafast = 最快，文件最大
     * fast      = 较快
     * medium    = 默认，平衡
     * slow      = 最慢，文件更小
     *
     * 用户看到的：一个下拉框，带中文说明
     */
    preset: 'ultrafast' | 'fast' | 'medium' | 'slow'

    /**
     * 输出分辨率
     * 对应 FFmpeg 参数：-vf "scale=-2:高度"
     *
     * source = 保持原始分辨率，不加 -vf
     * 1080   = 缩到 1080p，即 scale=-2:1080
     * 720    = 缩到 720p，即 scale=-2:720
     * 480    = 缩到 480p，即 scale=-2:480
     *
     * -2 的意思是：宽度按比例自动算，并保证是偶数
     *（编码器要求宽高必须是偶数）
     *
     * 用户看到的：一个下拉框，选项是「原始」「1080p」「720p」「480p」
     */
    resolution: 'source' | '1080' | '720' | '480'

    /**
     * 音频码率
     * 对应 FFmpeg 参数：-c:a aac -b:a 128k
     *
     * 96k  = 体积小，音质一般
     * 128k = 默认，平衡
     * 192k = 音质更好，体积稍大
     *
     * 音频统一用 AAC 编码，因为兼容性最好
     *
     * 用户看到的：一个下拉框，选项是「96k」「128k」「192k」
     */
    audioBitrate: '96k' | '128k' | '192k'

    /**
     * 输出目录名
     * 对应 .bat 脚本里的 OUT 变量
     *
     * 默认 "compressed"，意思是压缩后的视频放在
     * 脚本所在目录下的 compressed 文件夹里
     *
     * 脚本会自动创建这个目录，如果不存在
     *
     * 用户看到的：一个文本输入框，默认填 compressed
     */
    outputDir: string

    /**
     * 输出文件名后缀
     * 对应 .bat 脚本里的输出文件命名
     *
     * 默认 "_compressed"
     * 比如输入 a.mp4 → 输出 a_compressed.mp4
     *
     * 这样不会覆盖原文件，用户能对比压缩前后
     *
     * 用户看到的：一个文本输入框，默认填 _compressed
     */
    suffix: string

    /**
     * 是否跳过已存在的输出文件
     * 对应 .bat 脚本里的 if exist 判断
     *
     * true  = 如果 compressed 文件夹里已经有同名文件，就跳过
     * false = 不管存不存在，都重新处理
     *
     * 用途：脚本中断后重新运行，不用从头再来
     *
     * 用户看到的：一个开关，默认开启
     */
    skipExisting: boolean

    /**
     * 是否覆盖输出文件
     * 对应 FFmpeg 参数：-y
     *
     * true  = 输出文件已存在时，直接覆盖，不询问
     * false = 输出文件已存在时，FFmpeg 会卡在询问，脚本会停住
     *
     * 注意：在批处理脚本里，几乎必须为 true
     * 否则遇到已存在文件，脚本会卡住等用户输入
     *
     * 用户看到的：一个开关，默认开启
     *
     * ⚠️ 和 skipExisting 的关系：
     * - skipExisting 为 true 时，已存在的文件根本不会进入 FFmpeg
     * - overwrite 为 true 时，进入 FFmpeg 的文件会被直接覆盖
     * - 两者默认都开，逻辑上不冲突：
     *   先判断跳过，跳过的就不处理；没跳过的就覆盖处理
     */
    overwrite: boolean
}

// 合并表单
export interface MergeForm {
    operation: 'merge'
    inputPattern: '*.mp4' | '*.mp3' | '*.ts' | '*.mkv'
    outputName: string
    outputDir: string
    mode: 'copy' | 'reencode'   // 快速合并 / 重新编码
}

// 格式转换表单
export interface ConvertForm {
    /**
     * 操作类型
     *
     * 把视频/音频从一种容器格式转成另一种
     * 比如 mp4 → mkv、mov → mp4、mp4 → mp3（只抽音频）
     */
    operation: 'convert'

    /**
     * 源文件格式（脚本遍历的输入文件）
     * 对应 .bat 里的 for 循环通配符
     *
     * 默认 '*.mp4'，脚本只处理当前文件夹里的 .mp4
     *
     * 用户看到的：一个下拉框，「输入文件格式」
     */
    inputPattern: '*.mp4' | '*.mkv' | '*.mov' | '*.avi' | '*.webm' | '*.ts'


    /**
     * 目标格式（容器）
     * 对应 FFmpeg：由输出文件扩展名决定，不用显式参数
     *
     * mp4  = 兼容性最好，网页、手机、剪辑软件都认，但只支持特定编码组合
     * mkv  = 万能容器，几乎什么编码都能塞，但不适合网页直接播放
     * mov  = 苹果生态，剪辑软件常用
     * webm = 网页友好，配 VP9/Opus，开源
     * avi  = 老格式，兼容旧设备，但编码支持有限
     * mp3  = 只抽音频，视频轨丢弃
     * wav  = 无损音频，体积大
     *
     * 用户看到的：一个下拉框，「视频格式」和「音频格式」分组显示
     */
    targetFormat: 'mp4' | 'mkv' | 'mov' | 'webm' | 'avi' | 'mp3' | 'wav'

    /**
     * 视频编码器
     * 对应 FFmpeg 参数：-c:v
     *
     * copy      = 不重新编码，直接复制视频流（最快，体积不变）
     *             只在目标容器兼容原编码时可用，否则会报错
     * libx264   = H.264，兼容性最好
     * libx265   = H.265，体积更小，老设备可能不支持
     * libvpx-vp9 = VP9，配 webm 用，网页友好
     *
     * 当 targetFormat 是 mp3 / wav 时，此项无效（视频轨被丢弃）
     *
     * 用户看到的：一个下拉框，「不重新编码（最快）」+ 各编码器选项
     */
    videoCodec: 'copy' | 'libx264' | 'libx265' | 'libvpx-vp9'

    /**
     * 音频编码器
     * 对应 FFmpeg 参数：-c:a
     *
     * copy       = 不重新编码，直接复制音频流（最快）
     *              只在目标容器兼容原编码时可用
     * aac        = 兼容性最好，mp4/mkv/mov 都认
     * libmp3lame = MP3，老设备友好
     * libopus    = Opus，配 webm 用，同码率音质最好
     * pcm_s16le  = 无损 PCM，配 wav 用
     *
     * 用户看到的：一个下拉框
     */
    audioCodec: 'copy' | 'aac' | 'libmp3lame' | 'libopus' | 'pcm_s16le'

    /**
     * 音频码率
     * 对应 FFmpeg 参数：-b:a
     *
     * 仅在 audioCodec 不是 copy 时生效
     * wav（PCM）是无损格式，此参数无效
     *
     * 96k  = 体积小
     * 128k = 默认，平衡
     * 192k = 音质更好
     * 320k = 接近 MP3 上限
     *
     * 用户看到的：一个下拉框，audioCodec = copy 或 wav 时置灰
     */
    audioBitrate: '96k' | '128k' | '192k' | '320k'

    /**
     * 输出目录名
     * 对应 .bat 脚本里的 OUT 变量
     *
     * 默认 "converted"，压缩后的文件放在脚本目录下的 converted 文件夹里
     * 脚本会自动创建这个目录，如果不存在
     *
     * 用户看到的：一个文本输入框，默认填 converted
     */
    outputDir: string

    /**
     * 输出文件名后缀
     * 对应输出文件命名规则
     *
     * 默认 "_converted"
     * 比如输入 a.mp4，转成 mkv → 输出 a_converted.mkv
     *
     * 留空则直接替换扩展名：a.mp4 → a.mkv
     *
     * 用户看到的：一个文本输入框，默认填 _converted
     */
    suffix: string

    /**
     * 是否覆盖输出文件
     * 对应 FFmpeg 参数：-y
     *
     * true  = 输出文件已存在时直接覆盖，不询问
     * false = 输出文件已存在时，FFmpeg 会卡在询问，脚本停住
     *
     * 批处理脚本里几乎必须为 true，否则遇到已存在文件会卡死
     *
     * 用户看到的：一个开关，默认开启
     */
    overwrite: boolean


    /**
     * 是否跳过已经存在文件
     * true=跳过
     * false=不跳过
     */
    skipExisting: boolean

    /**
     * 提取模式
     *
     * none  = 正常转换（视频 + 音频都保留）
     * audio = 只提取音频（丢弃视频轨，加 -vn）
     * video = 只提取视频（丢弃音频轨，加 -an）
     */
    extractMode: 'none' | 'audio' | 'video'
}
// 联合类型
export type FormState = CompressForm | MergeForm | ConvertForm