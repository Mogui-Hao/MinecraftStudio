<template>
  <div class="scratch-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <h1>我的编程工作室</h1>
      <div class="controls">
        <button @click="runCode" class="btn run-btn">🏁 运行代码</button>
        <button @click="viewCode" class="btn view-btn">👁️ 查看代码</button>
        <button @click="clearWorkspace" class="btn clear-btn">🗑️ 清空</button>
        <button @click="saveProject" class="btn save-btn">💾 保存</button>
      </div>
    </div>

    <!-- 主要编辑区域 -->
    <div class="main-content">
      <!-- 左侧工具箱区域 -->
      <div class="toolbox-panel">
        <!-- scratch-blocks 会自动在这里生成工具箱 -->
      </div>

      <!-- 中间积木块工作区 -->
      <div class="workspace-panel">
        <div ref="scratchWorkspace" class="blockly-workspace"></div>
      </div>

      <!-- 右侧代码预览区 -->
      <div class="code-preview-panel" v-if="showCodePreview">
        <div class="panel-header">
          <h3>生成的代码</h3>
          <button @click="showCodePreview = false" class="close-btn">×</button>
        </div>
        <pre class="code-content">{{ generatedCode }}</pre>
      </div>
    </div>

    <!-- 底部输出区域 -->
    <div class="output-panel" v-if="showOutput">
      <div class="panel-header">
        <h3>运行输出</h3>
        <button @click="showOutput = false" class="close-btn">×</button>
      </div>
      <div class="output-content">
        <div v-for="(output, index) in outputs" :key="index" class="output-line">
          {{ output }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type {
  ScratchBlocks,
  WorkspaceSvg,
  Generator,
  Block,
  BlocklyEvent,
  BlockDefinition
} from 'scratch-blocks'

// 响应式数据
const scratchWorkspace = ref<HTMLDivElement>()
const showCodePreview = ref(false)
const showOutput = ref(false)
const generatedCode = ref('')
const outputs = ref<string[]>([])

let workspace: WorkspaceSvg | null = null
let ScratchBlocks: ScratchBlocks | null = null
let CustomLanguage: Generator | null = null

// 动态导入 scratch-blocks
const loadScratchBlocks = async (): Promise<ScratchBlocks | null> => {
  try {
    const module = await import('scratch-blocks')
    return (module.default || module) as ScratchBlocks
  } catch (error) {
    console.error('加载 scratch-blocks 失败:', error)
    return null
  }
}

// 创建自定义积木块
const createCustomBlocks = (): void => {
  if (!ScratchBlocks) return

  // 程序开始积木块
  const whenStartBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "当 🏁 被点击",
        nextStatement: null,
        category: "events",
        colour: "#FFD500",
        tooltip: "当绿旗被点击时开始执行"
      })
    }
  }
  ScratchBlocks.Blocks['custom_when_start'] = whenStartBlock

  // 移动积木块
  const moveBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "移动 %1 步",
        args0: [
          {
            type: "input_value",
            name: "STEPS",
            check: "Number"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "motion",
        colour: "#4C97FF",
        tooltip: "让角色移动指定的步数"
      })
    }
  }
  ScratchBlocks.Blocks['custom_move'] = moveBlock

  // 转向积木块
  const turnRightBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "右转 %1 度",
        args0: [
          {
            type: "input_value",
            name: "DEGREES",
            check: "Number"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "motion",
        colour: "#4C97FF",
        tooltip: "向右转指定角度"
      })
    }
  }
  ScratchBlocks.Blocks['custom_turn_right'] = turnRightBlock

  // 说话积木块
  const sayBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "说 %1 持续 %2 秒",
        args0: [
          {
            type: "input_value",
            name: "MESSAGE",
            check: "String"
          },
          {
            type: "input_value",
            name: "SECS",
            check: "Number"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "looks",
        colour: "#9966FF",
        tooltip: "显示文字气泡"
      })
    }
  }
  ScratchBlocks.Blocks['custom_say'] = sayBlock

  // 改变外观积木块
  const changeColorBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "将颜色特效增加 %1",
        args0: [
          {
            type: "input_value",
            name: "CHANGE",
            check: "Number"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "looks",
        colour: "#9966FF",
        tooltip: "改变角色的颜色"
      })
    }
  }
  ScratchBlocks.Blocks['custom_change_color'] = changeColorBlock

  // 播放声音积木块
  const playSoundBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "播放声音 %1",
        args0: [
          {
            type: "field_dropdown",
            name: "SOUND",
            options: [
              ["喵", "meow"],
              ["汪", "woof"],
              ["啾", "chirp"]
            ]
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "sound",
        colour: "#CF63CF",
        tooltip: "播放选中的声音"
      })
    }
  }
  ScratchBlocks.Blocks['custom_play_sound'] = playSoundBlock

  // 重复积木块
  const repeatBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "重复 %1 次",
        args0: [
          {
            type: "input_value",
            name: "TIMES",
            check: "Number"
          }
        ],
        message1: "%1",
        args1: [
          {
            type: "input_statement",
            name: "SUBSTACK"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "control",
        colour: "#FFAB19",
        tooltip: "重复执行内部的代码"
      })
    }
  }
  ScratchBlocks.Blocks['custom_repeat'] = repeatBlock

  // 如果...那么积木块
  const ifBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "如果 %1 那么",
        args0: [
          {
            type: "input_value",
            name: "CONDITION",
            check: "Boolean"
          }
        ],
        message1: "%1",
        args1: [
          {
            type: "input_statement",
            name: "SUBSTACK"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "control",
        colour: "#FFAB19",
        tooltip: "如果条件为真，执行内部代码"
      })
    }
  }
  ScratchBlocks.Blocks['custom_if'] = ifBlock

  // 等待积木块
  const waitBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "等待 %1 秒",
        args0: [
          {
            type: "input_value",
            name: "DURATION",
            check: "Number"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "control",
        colour: "#FFAB19",
        tooltip: "暂停程序执行"
      })
    }
  }
  ScratchBlocks.Blocks['custom_wait'] = waitBlock

  // 数字积木块
  const numberBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "%1",
        args0: [
          {
            type: "field_number",
            name: "NUM",
            value: 10
          }
        ],
        output: "Number",
        category: "data",
        colour: "#FF8C1A",
        tooltip: "数字值"
      })
    }
  }
  ScratchBlocks.Blocks['custom_number'] = numberBlock

  // 文本积木块
  const textBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "%1",
        args0: [
          {
            type: "field_input",
            name: "TEXT",
            text: "Hello!"
          }
        ],
        output: "String",
        category: "data",
        colour: "#FF8C1A",
        tooltip: "文本值"
      })
    }
  }
  ScratchBlocks.Blocks['custom_text'] = textBlock

  // 变量积木块
  const variableBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "我的变量",
        output: null,
        category: "data",
        colour: "#FF8C1A",
        tooltip: "变量值"
      })
    }
  }
  ScratchBlocks.Blocks['custom_variable'] = variableBlock

  // 设置变量积木块
  const setVariableBlock: BlockDefinition = {
    init() {
      this.jsonInit?.({
        message0: "将 我的变量 设为 %1",
        args0: [
          {
            type: "input_value",
            name: "VALUE"
          }
        ],
        previousStatement: null,
        nextStatement: null,
        category: "data",
        colour: "#FF8C1A",
        tooltip: "设置变量的值"
      })
    }
  }
  ScratchBlocks.Blocks['custom_set_variable'] = setVariableBlock
}

// 创建工具箱
const createToolbox = (): string => {
  return `
    <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
      <category name="事件" id="events" colour="#FFD500" secondaryColour="#CC9900">
        <block type="custom_when_start" id="when_start"></block>
      </category>

      <category name="动作" id="motion" colour="#4C97FF" secondaryColour="#4280D7">
        <block type="custom_move" id="move">
          <value name="STEPS">
            <shadow type="custom_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="custom_turn_right" id="turn_right">
          <value name="DEGREES">
            <shadow type="custom_number">
              <field name="NUM">15</field>
            </shadow>
          </value>
        </block>
      </category>

      <category name="外观" id="looks" colour="#9966FF" secondaryColour="#855CD6">
        <block type="custom_say" id="say">
          <value name="MESSAGE">
            <shadow type="custom_text">
              <field name="TEXT">Hello!</field>
            </shadow>
          </value>
          <value name="SECS">
            <shadow type="custom_number">
              <field name="NUM">2</field>
            </shadow>
          </value>
        </block>
        <block type="custom_change_color" id="change_color">
          <value name="CHANGE">
            <shadow type="custom_number">
              <field name="NUM">25</field>
            </shadow>
          </value>
        </block>
      </category>

      <category name="声音" id="sound" colour="#CF63CF" secondaryColour="#C94FC9">
        <block type="custom_play_sound" id="play_sound"></block>
      </category>

      <category name="控制" id="control" colour="#FFAB19" secondaryColour="#EC9C13">
        <block type="custom_repeat" id="repeat">
          <value name="TIMES">
            <shadow type="custom_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="custom_if" id="if_then"></block>
        <block type="custom_wait" id="wait">
          <value name="DURATION">
            <shadow type="custom_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
      </category>

      <category name="数据" id="data" colour="#FF8C1A" secondaryColour="#DB6E00">
        <block type="custom_number" id="number"></block>
        <block type="custom_text" id="text"></block>
        <block type="custom_variable" id="variable"></block>
        <block type="custom_set_variable" id="set_variable">
          <value name="VALUE">
            <shadow type="custom_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
      </category>
    </xml>
  `
}

// 设置代码生成器
const setupCodeGenerator = (): void => {
  if (!ScratchBlocks) return

  CustomLanguage = new ScratchBlocks.Generator('CustomLanguage')

  CustomLanguage.ORDER_ATOMIC = 0
  CustomLanguage.ORDER_NONE = 99

  // 定义代码生成函数类型
  type CodeGeneratorFunction = (block: Block) => string | [string, number]

  // 程序开始
  const whenStartGenerator: CodeGeneratorFunction = (block: Block) => {
    const nextStatement = CustomLanguage?.statementToCode(block, 'NEXT') ?? ''
    return `onStart() {\n${nextStatement}}\n`
  }

  // 移动
  const moveGenerator: CodeGeneratorFunction = (block: Block) => {
    const steps = CustomLanguage?.valueToCode(block, 'STEPS', CustomLanguage.ORDER_ATOMIC) ?? '0'
    return `move(${steps})\n`
  }

  // 转向
  const turnRightGenerator: CodeGeneratorFunction = (block: Block) => {
    const degrees = CustomLanguage?.valueToCode(block, 'DEGREES', CustomLanguage.ORDER_ATOMIC) ?? '0'
    return `turnRight(${degrees})\n`
  }

  // 说话
  const sayGenerator: CodeGeneratorFunction = (block: Block) => {
    const message = CustomLanguage?.valueToCode(block, 'MESSAGE', CustomLanguage.ORDER_ATOMIC) ?? '""'
    const secs = CustomLanguage?.valueToCode(block, 'SECS', CustomLanguage.ORDER_ATOMIC) ?? '2'
    return `say(${message}, ${secs})\n`
  }

  // 改变颜色
  const changeColorGenerator: CodeGeneratorFunction = (block: Block) => {
    const change = CustomLanguage?.valueToCode(block, 'CHANGE', CustomLanguage.ORDER_ATOMIC) ?? '0'
    return `changeColor(${change})\n`
  }

  // 播放声音
  const playSoundGenerator: CodeGeneratorFunction = (block: Block) => {
    const sound = block.getFieldValue('SOUND') as string
    return `playSound("${sound}")\n`
  }

  // 重复
  const repeatGenerator: CodeGeneratorFunction = (block: Block) => {
    const times = CustomLanguage?.valueToCode(block, 'TIMES', CustomLanguage.ORDER_ATOMIC) ?? '0'
    const substack = CustomLanguage?.statementToCode(block, 'SUBSTACK') ?? ''
    return `repeat(${times}) {\n${substack}}\n`
  }

  // 如果...那么
  const ifGenerator: CodeGeneratorFunction = (block: Block) => {
    const condition = CustomLanguage?.valueToCode(block, 'CONDITION', CustomLanguage.ORDER_ATOMIC) ?? 'true'
    const substack = CustomLanguage?.statementToCode(block, 'SUBSTACK') ?? ''
    return `if(${condition}) {\n${substack}}\n`
  }

  // 等待
  const waitGenerator: CodeGeneratorFunction = (block: Block) => {
    const duration = CustomLanguage?.valueToCode(block, 'DURATION', CustomLanguage.ORDER_ATOMIC) ?? '1'
    return `wait(${duration})\n`
  }

  // 数字
  const numberGenerator: CodeGeneratorFunction = (block: Block) => {
    const number = block.getFieldValue('NUM') as number
    return [String(number), CustomLanguage?.ORDER_ATOMIC ?? 0]
  }

  // 文本
  const textGenerator: CodeGeneratorFunction = (block: Block) => {
    const text = block.getFieldValue('TEXT') as string
    return [`"${text}"`, CustomLanguage?.ORDER_ATOMIC ?? 0]
  }

  // 变量
  const variableGenerator: CodeGeneratorFunction = () => {
    return ['myVariable', CustomLanguage?.ORDER_ATOMIC ?? 0]
  }

  // 设置变量
  const setVariableGenerator: CodeGeneratorFunction = (block: Block) => {
    const value = CustomLanguage?.valueToCode(block, 'VALUE', CustomLanguage.ORDER_ATOMIC) ?? '0'
    return `myVariable = ${value}\n`
  }

  // 将生成器函数赋值给相应的积木块类型
  const generators: Record<string, CodeGeneratorFunction> = {
    'custom_when_start': whenStartGenerator,
    'custom_move': moveGenerator,
    'custom_turn_right': turnRightGenerator,
    'custom_say': sayGenerator,
    'custom_change_color': changeColorGenerator,
    'custom_play_sound': playSoundGenerator,
    'custom_repeat': repeatGenerator,
    'custom_if': ifGenerator,
    'custom_wait': waitGenerator,
    'custom_number': numberGenerator,
    'custom_text': textGenerator,
    'custom_variable': variableGenerator,
    'custom_set_variable': setVariableGenerator
  }

  // 注册所有生成器
  Object.entries(generators).forEach(([blockType, generator]) => {
    (CustomLanguage as Record<string, CodeGeneratorFunction>)[blockType] = generator
  })
}

// 生成代码
const generateCode = (): string => {
  if (!workspace || !CustomLanguage) return ''

  try {
    const code = CustomLanguage.workspaceToCode(workspace)
    return code
  } catch (error) {
    console.error('生成代码失败:', error)
    return ''
  }
}

// 初始化编辑器
const initScratchEditor = async (): Promise<void> => {
  await nextTick()

  const SB = await loadScratchBlocks()
  if (!SB || !scratchWorkspace.value) {
    console.error('无法初始化 Scratch 编辑器')
    return
  }

  ScratchBlocks = SB

  // 创建自定义积木块
  createCustomBlocks()

  // 设置代码生成器
  setupCodeGenerator()

  // 获取工具箱
  const toolboxXml = createToolbox()

  try {
    // 创建工作区
    workspace = ScratchBlocks.inject(scratchWorkspace.value, {
      toolbox: toolboxXml,
      colours: {
        workspace: '#F9F9F9',
        flyout: '#F2F2F2',
        scrollbar: '#CCCCCC',
        scrollbarHover: '#AAAAAA',
        insertionMarker: '#FFD500',
        insertionMarkerOpacity: 0.3,
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6
      },
      sounds: true,
      trashcan: true,
      collapse: false,
      comments: true,
      disable: false,
      maxBlocks: Infinity,
      oneBasedIndex: true,
      readOnly: false,
      rtl: false,
      scrollbars: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 4,
        minScale: 0.25,
        scaleSpeed: 1.2
      }
    })

    // 添加变化监听器
    workspace.addChangeListener((event: BlocklyEvent) => {
      if (event.type === 'create' || event.type === 'delete' || event.type === 'change' || event.type === 'move') {
        updateGeneratedCode()
      }
    })

    console.log('Scratch 编辑器初始化成功!')

  } catch (error) {
    console.error('初始化工作区失败:', error)
  }
}

// 更新生成的代码
const updateGeneratedCode = (): void => {
  generatedCode.value = generateCode()
}

// 运行代码
const runCode = (): void => {
  const code = generateCode()
  if (!code.trim()) {
    alert('请先添加一些积木块！')
    return
  }

  console.log('运行代码:', code)

  // 模拟代码执行
  outputs.value = []
  showOutput.value = true

  // 这里你可以实现真正的代码执行逻辑
  outputs.value.push('🏁 程序开始运行...')
  outputs.value.push('📄 生成的代码:')
  outputs.value.push(code)
  outputs.value.push('✅ 程序运行完成!')

  // 你可以在这里调用你的自定义编程语言解释器
  // executeCustomLanguage(code)
}

// 查看代码
const viewCode = (): void => {
  updateGeneratedCode()
  showCodePreview.value = true
}

// 清空工作区
const clearWorkspace = (): void => {
  if (workspace && confirm('确定要清空所有积木块吗？')) {
    workspace.clear()
    generatedCode.value = ''
    outputs.value = []
  }
}

// 保存项目 (需要扩展 scratch-blocks 模块类型)
const saveProject = (): void => {
  if (!workspace) return

  try {
    // 这里需要访问 Xml 相关 API，我们暂时使用类型断言
    const scratchBlocksWithXml = ScratchBlocks as ScratchBlocks & {
      Xml: {
        workspaceToDom(workspace: WorkspaceSvg): Document
        domToText(dom: Document): string
      }
    }

    const xml = scratchBlocksWithXml.Xml.workspaceToDom(workspace)
    const xmlText = scratchBlocksWithXml.Xml.domToText(xml)

    const blob = new Blob([xmlText], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'my-project.xml'
    link.click()

    URL.revokeObjectURL(url)

    alert('项目已保存!')
  } catch (error) {
    console.error('保存项目失败:', error)
    alert('保存失败，请重试')
  }
}

// 生命周期
onMounted(() => {
  initScratchEditor()
})

onUnmounted(() => {
  if (workspace) {
    workspace.dispose()
    workspace = null
  }
})
</script>

<style scoped>
/* 样式保持不变 */
.scratch-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  background-color: #F0F0F0;
}

.toolbar {
  height: 60px;
  background: linear-gradient(90deg, #4C97FF 0%, #9966FF 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar h1 {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.run-btn {
  background-color: #4CAF50;
  color: white;
}

.view-btn {
  background-color: #2196F3;
  color: white;
}

.clear-btn {
  background-color: #FF5722;
  color: white;
}

.save-btn {
  background-color: #FF9800;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.toolbox-panel {
  width: 250px;
  background-color: #F9F9F9;
  border-right: 2px solid #E0E0E0;
}

.workspace-panel {
  flex: 1;
  background-color: #FFFFFF;
  position: relative;
}

.blockly-workspace {
  width: 100%;
  height: 100%;
}

.code-preview-panel {
  width: 400px;
  background-color: #2D3748;
  border-left: 2px solid #E0E0E0;
  display: flex;
  flex-direction: column;
}

.output-panel {
  height: 200px;
  background-color: #1A202C;
  border-top: 2px solid #E0E0E0;
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 40px;
  background-color: #4A5568;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  border-bottom: 1px solid #2D3748;
}

.panel-header h3 {
  color: white;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: #E53E3E;
}

.code-content {
  flex: 1;
  padding: 15px;
  margin: 0;
  color: #F7FAFC;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow: auto;
  background-color: #2D3748;
}

.output-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #1A202C;
}

.output-line {
  color: #E2E8F0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 5px;
  padding: 2px 0;
}

.output-line:last-child {
  margin-bottom: 0;
}

/* 全局样式覆盖，确保 Scratch 风格 */
:deep(.blocklyMainBackground) {
  fill: #FFFFFF !important;
}

:deep(.blocklyFlyoutBackground) {
  fill: #F2F2F2 !important;
}

:deep(.blocklyScrollbarBackground) {
  fill: #CCCCCC !important;
}

:deep(.blocklyTrash) {
  opacity: 0.8;
}

:deep(.blocklyTrash:hover) {
  opacity: 1;
}

/* 工具箱样式 */
:deep(.blocklyToolboxDiv) {
  background-color: #F9F9F9 !important;
  border: none !important;
}

:deep(.blocklyTreeRow) {
  border-radius: 8px !important;
  margin: 4px 8px !important;
}

:deep(.blocklyTreeRowSelected) {
  background-color: rgba(76, 151, 255, 0.2) !important;
}
</style>
