<template>
  <div class="editor-container">
    <!-- 编辑器操作按钮 -->
    <div class="editor-toolbar">
      <button @click="formatCode" :disabled="!editorInstance">格式化代码</button>
      <button @click="toggleTheme">切换主题</button>
      <span class="lang-tag">当前语言：{{ editorLang.toUpperCase() }}</span>
    </div>

    <!-- Monaco 编辑器主体 -->
    <div class="editor-wrapper">
      <monaco-editor
        v-model="codeContent"
        :language="editorLang"
        :options="editorOptions"
        @editor-mounted="handleEditorMounted"
        @editor-unmounted="handleEditorUnmounted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MonacoEditor from 'monaco-editor-vue3';
// 导入 Monaco 核心类型（关键！）
import type {
  IStandaloneCodeEditor,
  IEditorConstructionOptions,
  EditorLanguage
} from 'monaco-editor';

// ---------------------- 响应式状态 ----------------------
// 编辑器内容（双向绑定）
const codeContent = ref<string>(
  `// 欢迎使用 TypeScript 在线编辑器
interface User {
  id: number;
  name: string;
}

function createUser(id: number, name: string): User {
  return { id, name };
}

// 示例：创建用户并打印
const newUser = createUser(1, 'Vue 3');
console.log('新用户：', newUser);`
);

// 当前编辑语言（支持 'typescript'/'javascript'/'html' 等）
const editorLang = ref<EditorLanguage>('typescript');

// 编辑器实例（允许 null，初始无实例）
let editorInstance: IStandaloneCodeEditor | null = null;

// ---------------------- 编辑器配置 ----------------------
const editorOptions = ref<IEditorConstructionOptions>({
  automaticLayout: true,       // 自动适配容器大小
  fontSize: 14,                // 字体大小
  lineNumbers: 'on',           // 显示行号
  roundedSelection: false,     // 选中区域无圆角
  scrollBeyondLastLine: false, // 禁止滚动到末尾空白
  theme: 'vs-dark',            // 初始主题（vs / vs-dark / hc-black）
  minimap: { enabled: false }, // 禁用小地图
  tabSize: 2,                  // Tab 缩进 2 空格
  wordWrap: 'on',              // 自动换行
  suggestOnTriggerCharacters: true, // 触发字符提示
  quickSuggestions: true,      // 快速建议
});

// ---------------------- 编辑器生命周期 ----------------------
// 编辑器挂载后回调（获取实例）
const handleEditorMounted = (editor: IStandaloneCodeEditor) => {
  editorInstance = editor;
  console.log('编辑器已挂载，实例类型：', editor);

  // 示例：监听内容变化（也可以通过 v-model 同步）
  editor.onDidChangeModelContent(() => {
    console.log('内容更新：', editor.getValue());
  });

  // 示例：注册自定义命令（如 Ctrl+S 保存）
  editor.addCommand(monaco.KeyCode.KeyS, () => {
    if (editorInstance) {
      const code = editorInstance.getValue();
      console.log('触发保存操作，当前代码：', code);
    }
  }, 'ctrl+s');
};

// 编辑器卸载时清理（可选）
const handleEditorUnmounted = () => {
  editorInstance = null;
  console.log('编辑器已卸载');
};

// ---------------------- 扩展功能 ----------------------
// 格式化代码（使用 Monaco 内置格式化）
const formatCode = () => {
  if (editorInstance) {
    editorInstance.getAction('editor.action.formatDocument')?.run();
  }
};

// 切换主题（vs-dark ↔ vs）
const toggleTheme = () => {
  if (editorInstance) {
    const newTheme = editorInstance.getTheme() === 'vs-dark' ? 'vs' : 'vs-dark';
    monaco.editor.setTheme(newTheme);
    editorOptions.value.theme = newTheme; // 同步配置
  }
};
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100vh; /* 占满视口高度 */
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  padding: 12px;
  background: #1e1e1e; /* vs-dark 主题工具栏颜色 */
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 16px;
}

.editor-toolbar button {
  padding: 6px 12px;
  background: #3a3a3a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.editor-toolbar button:hover {
  background: #4a4a4a;
}

.editor-toolbar button:disabled {
  background: #2a2a2a;
  cursor: not-allowed;
}

.lang-tag {
  color: #d4d4d4;
  font-size: 14px;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
}
</style>
