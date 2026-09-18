export interface FormState{
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