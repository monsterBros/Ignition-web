import { compileModuleResolve, sucraseTransformCode } from '../builder'
import { connectJsRuntimeVM, InjectVMVarsType } from "./iframe";
import { logger } from '..';

export * from "./iframe";
export * from './scope'


export interface ExecuteResult {
	value: any;
	error: any;
	success: boolean;
}

/**
 *
 * @param code 执行的同步代码
 * @param globalScope 全局Scope实例
 */

/**
 * 
 * 这段代码的主要作用是在隔离的沙箱环境中安全地执行用户提供的 JavaScript 代码，同时允许代码访问注入的全局变量。
 * 通过这种方式，可以确保代码的执行不会影响到主应用的正常运行，同时提供必要的上下文环境
 */

// 作用：在沙箱环境中执行同步的js代码 
// 返回执行结果，包括执行值，是否成功以及错误信息
// gloabalScope：全局作用域对象，注入变量
const handleExecuteEvalCode = (
	code: string,
	gloabalScope?: InjectVMVarsType
) => {
	try {
		const { sandbox } = connectJsRuntimeVM()
		// 获取沙箱实例环境，这是隔离的js执行环境

		sandbox.__INJECT_VARS__ = gloabalScope;
		// 将全局作用域对 globalScope赋值给沙箱的 __INJECT_VARS__属性，  这样可以在沙箱中访问这些变量

		/*
			使用沙箱环境中的 eval 方法执行代码
			代码包裹在立即执行表达式中
			用with语句将__INJECT_VARS__  中的变量 注入到当前作用域
			执行传入的代码 (${code}) 并返回结果	
		*/
		const value = sandbox.eval(`
        (() => {
          with (window.__INJECT_VARS__) {
            return (${code})
          }
        })()
      `);
		// value: 执行结果
		return { value, success: true, error: null } as ExecuteResult;
	} catch (error) {
		return { success: false, error, value: null } as ExecuteResult;
	}
};

/**
 * 
 * @param packageName 包名
 * @param cdnUrl 包地址
 */
const handleInstallNpm = async (packageName: string, cdnUrl?: string) => {
	// if (cdnUrl) {
	//   const data = await import(cdnUrl)
	//   console.log(data, 'data')
	// } else {
	//   logger.error("CDN路径不存在")
	// }
}

/**
 * 处理当前模块地址
 * @param code 代码
 */
const handleMountJsMoudle = async (
	code: string,
) => {
	// 创建运行时沙箱环境
	const { sandbox } = connectJsRuntimeVM()
	// 将代码转换成commonjs代码， 用 sucrase转换工具，支持ts，jsx语法转换
	const cjsCode = await sucraseTransformCode(code)
	if (cjsCode) {
		// 解析编译转换后commonjs代码，  将代码字符串转换可执行模块对象。
		// andbox.huosScope.depends 沙箱中依赖项
		// 返回值module  解析和编译后模块对象， exports属性：模块导出内容
		const module = compileModuleResolve(cjsCode, sandbox.huosScope.depends)
		console.log(module, 'module')
		// 解析后模块导出内容挂载到沙箱环境huosScope
		sandbox.huosScope.jsMoudle = module.exports
		/*
		jsMoudle:
		huosScope 中的一个属性，用于存储 JavaScript 模块
		通过这个属性，可以在沙箱环境中访问挂载的模块
		module.exports:
		解析后的模块的导出内容
		包含模块中通过 export 或 module.exports 导出的所有内容
		*/
		logger.info("JS模块挂载成功")
	}
}

export const jsRuntime = {
	execute: handleExecuteEvalCode,
	mountJsMoudle: handleMountJsMoudle,
	installNpm: handleInstallNpm
};
