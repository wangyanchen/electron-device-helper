/**
 * 电子秤匹配规则
 */
export interface ScalePattern {
    name: string;
    regexp: RegExp;
    matchRegExp: RegExp;
}
