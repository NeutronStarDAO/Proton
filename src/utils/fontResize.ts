// 适配不同尺寸屏幕（动态计算根元素的大小fonSize）
export const fontResize = () => {


    function resizeCount() {
        const baseConstn = 192 // 1920的设计稿 / 基数10
        const nowWidth = document.documentElement.clientWidth
        const nowCount = nowWidth / baseConstn
        // @ts-ignore
        document.querySelector('html').style.fontSize = nowCount + 'px'
    }

// 初始化
    resizeCount()

    window.addEventListener('resize', () => {
        resizeCount()
    })
}
