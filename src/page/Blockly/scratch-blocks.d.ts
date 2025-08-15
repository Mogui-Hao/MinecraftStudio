declare module 'scratch-blocks' {
  export interface BlocklyEvent {
    type: string
    blockId?: string
    workspaceId?: string
    [key: string]: unknown
  }

  export interface BlockDefinition {
    init(): void
    jsonInit?(json: BlockConfig): void
    getFieldValue?(name: string): string | number
    setColour?(color: string): void
    setPreviousStatement?(enabled: boolean, check?: string | null): void
    setNextStatement?(enabled: boolean, check?: string | null): void
    setTooltip?(tooltip: string): void
    appendDummyInput?(): BlockInput
    appendValueInput?(name: string): BlockInput
    appendStatementInput?(name: string): BlockInput
  }

  export interface BlockInput {
    appendField(field: Field | string, name?: string): BlockInput
    setCheck(check: string | string[] | null): BlockInput
  }

  export type Field = object

  export interface BlockConfig {
    message0?: string
    message1?: string
    args0?: BlockArg[]
    args1?: BlockArg[]
    previousStatement?: boolean | null
    nextStatement?: boolean | null
    output?: string | null
    category?: string
    colour?: string
    tooltip?: string
  }

  export interface BlockArg {
    type: string
    name?: string
    check?: string | string[]
    text?: string
    value?: string | number
    options?: [string, string][]
  }

  export interface Block {
    type: string
    getFieldValue(name: string): string | number
    getChildren(): Block[]
    workspace: WorkspaceSvg
  }

  export interface WorkspaceSvg {
    addChangeListener(callback: (event: BlocklyEvent) => void): void
    dispose(): void
    getTopBlocks(): Block[]
    clear(): void
    getAllBlocks(): Block[]
  }

  // 修复：更精确的 Generator 接口定义
  export interface Generator {
    workspaceToCode(workspace: WorkspaceSvg): string
    valueToCode(block: Block, name: string, order: number): string
    statementToCode(block: Block, name: string): string
    ORDER_ATOMIC: number
    ORDER_NONE: number
    // 添加索引签名以支持动态添加代码生成器函数
    [blockType: string]: unknown
  }

  export interface InjectionOptions {
    toolbox?: string | Element
    colours?: {
      workspace?: string
      flyout?: string
      scrollbar?: string
      scrollbarHover?: string
      insertionMarker?: string
      insertionMarkerOpacity?: number
      fieldShadow?: string
      dragShadowOpacity?: number
    }
    sounds?: boolean
    trashcan?: boolean
    collapse?: boolean
    comments?: boolean
    disable?: boolean
    maxBlocks?: number
    oneBasedIndex?: boolean
    readOnly?: boolean
    rtl?: boolean
    scrollbars?: boolean
    zoom?: {
      controls?: boolean
      wheel?: boolean
      startScale?: number
      maxScale?: number
      minScale?: number
      scaleSpeed?: number
    }
  }

  export interface FieldConstructors {
    FieldNumber: new (value?: number, min?: number, max?: number) => Field
    FieldTextInput: new (value?: string) => Field
    FieldInput: new (value?: string) => Field
    FieldDropdown: new (options: [string, string][]) => Field
  }

  export interface ScratchBlocks extends FieldConstructors {
    inject(container: Element | string, options?: InjectionOptions): WorkspaceSvg
    Blocks: Record<string, BlockDefinition>
    Generator: new (name: string) => Generator
    // 添加 XML 相关接口
    Xml: {
      workspaceToDom(workspace: WorkspaceSvg): Document
      domToText(dom: Document): string
    }
  }

  const scratchBlocks: ScratchBlocks
  export default scratchBlocks
}
