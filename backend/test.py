def split_string(s: str, schema: dict) -> list:
    # 收集所有可能的「父级_子级」组合
    parent_child_pairs = []
    for parent_key, parent_value in schema.items():
        if isinstance(parent_value, dict):  # 父级是非叶子节点（有子键）
            for child_key in parent_value.keys():
                parent_child_pairs.append(f"{parent_key}_{child_key}")

    # 检查当前字符串是否是某个「父级_子级」组合
    if s in parent_child_pairs:
        parent, child = s.split("_", 1)  # 仅分割一次（避免多下划线干扰）
        return [parent, child]
    else:
        return [s]
