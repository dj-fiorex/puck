/**
 * Recursively traverses a nested structure of blocks, executing callbacks on each block.
 * A block is identified as an object with both type and props properties.
 *
 * @param {Object|Array|*} structure - The structure to traverse. Can be an object, array, or primitive value.
 * @param {Function} callback - A callback function that is called for each block encountered.
 *                              Receives the block object as its argument.
 * @param {Function} [transformCallback] - An optional callback function that can transform/replace blocks.
 *                                         Should return the transformed block, an array of blocks, or undefined to keep the original.
 *                                         Receives the block object as its argument.
 * @returns {Promise<Object|Array|*>} A promise that resolves to a new structure with the same shape as the input, potentially with transformed blocks.
 */
export async function traverseBlocks(
  structure: object | Array<any> | any,
  callback: (block: any) => void | Promise<void>,
  transformCallback?: (block: any) => any | Promise<any>
): Promise<object | Array<any> | any> {
  // Handle array input
  if (Array.isArray(structure)) {
    const traversed = await Promise.all(
      structure.map((item) => traverseBlocks(item, callback, transformCallback))
    );

    return traversed.flat();
  }

  // Handle object input
  if (structure && typeof structure === "object") {
    let currentStructure = structure;

    // Check if this is a block (has type and props)
    if (structure.type && structure.props) {
      await callback(structure);

      // If transform callback exists, use it to potentially replace the block
      if (transformCallback) {
        const transformed = await transformCallback(structure);
        if (transformed) {
          // If transformed result is an array, return it directly (will be flattened by flatMap)
          if (Array.isArray(transformed)) {
            const transformedBlocks = await Promise.all(
              transformed.map((block) =>
                traverseBlocks(block, callback, transformCallback)
              )
            );

            return transformedBlocks.flat();
          }
          currentStructure = transformed;
        }
      }
    }

    // Recursively traverse all properties
    const result = { ...currentStructure };
    await Promise.all(
      Object.keys(currentStructure).map(async (key) => {
        const value = currentStructure[key];

        if (Array.isArray(value)) {
          const traversedArray = await Promise.all(
            value.map((item) =>
              traverseBlocks(item, callback, transformCallback)
            )
          );
          result[key] = traversedArray.flat();
        } else if (value && typeof value === "object") {
          result[key] = await traverseBlocks(
            value,
            callback,
            transformCallback
          );
        }
      })
    );

    return result;
  }

  return structure;
}
