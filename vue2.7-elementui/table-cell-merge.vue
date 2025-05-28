<script setup lang="ts">
import randomUUID from "../utils/randomUUID";

const tableData = [
  {
    id: randomUUID(),
    sjx: "物理特性",
    value: "值1",
    cisj: "2023-10-01",
    verified: false,
    children: [
      {
        id: randomUUID(),
        sjx: "几何特性",
        value: "值1-1",
        cisj: "2023-10-02",
        verified: true,
        children: [
          {
            id: randomUUID(),
            sjx: "长度",
            value: "值1-1-1",
            cisj: "2023-10-02",
            verified: true,
          },
          {
            id: randomUUID(),
            sjx: "宽度",
            value: "值1-1-2",
            cisj: "2023-10-02",
            verified: false,
          }
        ]
      },
      {
        id: randomUUID(),
        sjx: "光学特性",
        value: "值1-2",
        cisj: "2023-10-03",
        verified: false,
        children: [
          {
            id: randomUUID(),
            sjx: "颜色",
            value: "值1-2-1",
            cisj: "2023-10-03",
            verified: true,
          },
          {
            id: randomUUID(),
            sjx: "亮度",
            value: "值1-2-2",
            cisj: "2023-10-03",
            verified: false,
          },
          {
            id: randomUUID(),
            sjx: "对比度",
            value: "值1-2-3",
            cisj: "2023-10-03",
            verified: true,
          }
        ]
      },
      {
        id: randomUUID(),
        sjx: "结构特性",
        value: "值1-3",
        cisj: "2023-10-04",
        verified: true,
      }
    ]
  },
  {
    id: randomUUID(),
    sjx: "功能特性",
    value: "值2",
    cisj: "2023-10-04",
    verified: true,
    children: [
      {
        id: randomUUID(),
        sjx: "作用和价值",
        value: "值2-1",
        cisj: "2023-10-05",
        verified: false,
      },
      {
        id: randomUUID(),
        sjx: "恢复潜能",
        value: "值2-2",
        cisj: "2023-10-06",
        verified: true,
      },
      {
        id: randomUUID(),
        sjx: "通信能力",
        value: "值2-3",
        cisj: "2023-10-07",
        verified: false,
        children: [
          {
            id: randomUUID(),
            sjx: "通信装备",
            value: "值2-3-1",
            cisj: "2023-10-07",
            verified: true,
          },
          {
            id: randomUUID(),
            sjx: "通信范围",
            value: "值2-3-2",
            cisj: "2023-10-07",
            verified: false,
          }
        ]
      }
    ]
  }
]

function flattenTreeWithParentInfo(data) {
  const result = [];

  function traverse(nodes, parentInfo = { level: 0, parentIds: [] }) {
    nodes.forEach(node => {
      // 去除子节点属性（避免冗余），并添加层级和父级信息
      const { children, ...rest } = node;
      const newNode = {
        ...rest,
        level: parentInfo.level + 1,
        parentIds: [...parentInfo.parentIds],
      };

      // 动态添加 parent1id、parent2id 等字段
      parentInfo.parentIds.forEach((id, index) => {
        newNode[`parent${index + 1}id`] = id;
      });

      result.push(newNode);

      // 递归处理子节点
      if (children && children.length > 0) {
        traverse(children, {
          level: parentInfo.level + 1,
          parentIds: [node.id, ...parentInfo.parentIds],
        });
      }
    });
  }

  traverse(data);
  return result;
}

const flattenData = flattenTreeWithParentInfo(tableData);

const ids = {}
for (const tableDatum of flattenData) {
  ids[tableDatum.id] = tableDatum;
}

// console.log(ids)

function getDeepestNodesWithParentIds(data) {
  const result = [];

  function traverse(nodes, parentIds) {
    nodes.forEach(node => {
      // 判断是否为叶子节点（无children或children为空）
      const isLeaf = !node.children || node.children.length === 0;
      if (isLeaf) {
        // 创建新对象，保留原属性，并添加父级ID
        const newNode = { ...node };
        parentIds.forEach((id, index) => {
          newNode[`parent${index + 1}`] = id;
        });
        result.push(newNode);
      } else {
        // 递归处理子节点，传递当前节点的ID及父级ID列表
        const newParentIds = [node.id, ...parentIds];
        traverse(node.children, newParentIds);
      }
    });
  }

  traverse(data, []);
  const depth1 = getDepth(result);
  return result.map(item => {
    let keys = Object.keys(item).filter(key => key.startsWith('parent'))
    const parents = {}
    if (keys.length !== depth1.length) {
      keys = [...depth1.toReversed().slice(keys.length).map(v => `parent${v}`), ...keys,];
      for (const key of keys) {
        const index = parseInt(key.substring(6)) - 1;
        if (index >= 0) {
          parents[`parent${index + 1}`] = ids[item[key]]?.sjx ?? item.sjx;
        }
      }
      const keys1 = Object.keys(parents);
      const values = Object.values(parents).reverse();
      const reverseData = Object.fromEntries(keys1.map((key, index) => [key, values[index]]))
      return { ...item, ...reverseData }
    } else {
      for (const key of keys) {
        const index = parseInt(key.substring(6)) - 1;
        if (index >= 0) {
          parents[`parent${index + 1}`] = ids[item[key]]?.sjx ?? item.sjx;
        }
      }
      return { ...item, ...parents }
    }
  });
}

const list = getDeepestNodesWithParentIds(tableData)

// console.log("list", list)

const mergeObj = {}
const mergeArr = Object.keys(list[0]);

for (const key of mergeArr) {
  let count = 0; // 用来记录需要合并行的起始位置
  mergeObj[key] = []; // 记录每一列的合并信息
  list.forEach((item, index) => {
    // index == 0表示数据为第一行，直接 push 一个 1
    if (index === 0) {
      mergeObj[key].push(1);
    } else {
      // 判断当前行是否与上一行其值相等 如果相等 在 count 记录的位置其值 +1 表示当前行需要合并 并push 一个 0 作为占位
      if (item[key] === list[index - 1][key]) {
        mergeObj[key][count] += 1;
        mergeObj[key].push(0);
      } else {
        // 如果当前行和上一行其值不相等
        count = index; // 记录当前位置
        mergeObj[key].push(1); // 重新push 一个 1
      }
    }
  })
}
const spanMap = new Map();

function objectSpanMethod({ row, column, rowIndex, columnIndex }) {
  if (![1, 2, 3].includes(columnIndex)) return { colspan: 1, rowspan: 1 };
  spanMap.set(`${rowIndex}-${columnIndex}`, { row, column, rowIndex, columnIndex });
  const sjx = row.sjx
  const i = column.property.substring(6);
  let count = 1
  for (let j = i; j < depth.length; j++) {
    if (row['parent' + j] === sjx) {
      count++;
    } else {
      break;
    }
  }
  if (count > 1) {
    return [1, count];
  }
  const last = spanMap.get(`${rowIndex}-${columnIndex - 1}`)
  const key = column.property === 'sjx' ? `parent${depth.length - 1}` : `parent${depth.length}`;

  if (last?.row[key] === row[column.property]) {
    return [0, 0];
  }
  if (mergeArr.indexOf(column.property) !== -1) {
    const mergeRow = mergeObj[column.property][rowIndex]
    if (mergeRow) {
      return [mergeRow, 1]
    }
    return [0, 0];
  }

  return { colspan: 1, rowspan: 1 };
}

function getDepth(array) {
  let maxParent = 0;
  for (const item of array) {
    const keys = Object.keys(item)
    const parentKeys = keys.filter(key => key.startsWith('parent')).map(key => key.substring(6));
    maxParent = Math.max(maxParent, ...parentKeys);
  }
  return new Array(maxParent).fill(0).map((_, i) => i + 1).reverse()
}

const depth = getDepth(list)

function headCellStyle({ row }) {
  if (row.length === depth.length + 1) {
    return { display: 'none' }
  }

  return {
    background: '#f5f7fa',
    color: '#606266',
    fontWeight: 'bold',
  }
}

</script>

<template>
  <main>
    <el-table border :data="list" :span-method="objectSpanMethod" :header-cell-style="headCellStyle">
      <el-table-column align="center" label="序号" type="index"/>
      <el-table-column align="center" label="数据项">
        <el-table-column align="center" :prop="'parent'+item" v-for="item in depth" :key="item"/>
        <el-table-column align="center" prop="sjx"/>
      </el-table-column>
      <el-table-column align="center" prop="value" label="值"/>
      <el-table-column align="center" prop="cisj" label="侦察/核查时间"/>
      <el-table-column align="center" prop="verified" label="是否核查" width="80">
        <el-checkbox/>
      </el-table-column>
    </el-table>
  </main>
</template>
