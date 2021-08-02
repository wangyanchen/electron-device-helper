"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 延迟
 * @param {number} timeout 延时时间
 */
exports.sleep = (timeout) => {
    return new Promise((resolve, reject) => { setTimeout(resolve, timeout); });
};
