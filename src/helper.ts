/**
 * 延迟
 * @param {number} timeout 延时时间
 */
export const sleep = (timeout: number): Promise<void> => {
    return new Promise((resolve, reject) => { setTimeout(resolve, timeout) })
}
