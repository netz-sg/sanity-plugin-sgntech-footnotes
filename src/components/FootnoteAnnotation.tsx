import {type BlockAnnotationProps, type Path, useFormValue} from 'sanity'

import {collectFootnotes} from '../lib/collect'
import {keyOf} from '../lib/keys'

/**
 * Walks up from the annotation to the Portable Text field it lives in.
 *
 * The form path of an annotation looks like
 * `['body', {_key: 'block'}, 'markDefs', {_key: 'annotation'}]`, so dropping the
 * last three segments lands on the array itself — whatever the field is called
 * and however deeply it is nested.
 */
function portableTextPath(path: Path): Path {
  const index = path.lastIndexOf('markDefs')
  if (index < 1) return []
  return path.slice(0, index - 1)
}

/**
 * Renders the annotated text in the editor with the number it will carry in the
 * finished article. The number comes from the current position in the text, so
 * moving a paragraph renumbers everything immediately — the same counting the
 * frontend does.
 */
export function createFootnoteAnnotation(typeName: string) {
  return function FootnoteAnnotation(props: BlockAnnotationProps): React.JSX.Element {
    const blocks = useFormValue(portableTextPath(props.path))

    const key = keyOf(props.value)
    const number = key ? collectFootnotes(blocks, {typeName}).numberOf(key) : undefined

    return (
      <span>
        {props.renderDefault(props)}
        {number ? (
          <sup
            contentEditable={false}
            style={{fontSize: '0.75em', lineHeight: 0, verticalAlign: 'super', opacity: 0.8}}
          >
            {number}
          </sup>
        ) : null}
      </span>
    )
  }
}
