import { ref, computed, onMounted, defineComponent, PropType, watch } from 'vue';
import config from '../config';
import Picker from './picker.class';
import { PickerColumnItem, PickerValue } from './type';
import { usePrefixClass } from '../hooks/useClass';

const { prefix } = config;

export default defineComponent({
  name: `${prefix}-picker-item`,
  props: {
    options: {
      type: Array as PropType<PickerColumnItem[]>,
    },
    value: {
      type: [String, Number] as PropType<PickerValue>,
      default: undefined,
    },
    renderLabel: {
      type: Function,
      default: undefined,
    },
    onPick: {
      type: Function,
      default: undefined,
    },
  },
  emits: ['pick'],
  setup(props, context) {
    const pickerItemClass = usePrefixClass('picker-item');

    let picker: Picker | null = null;
    const root = ref();
    const getIndexByValue = (val: number | string | undefined) => {
      let defaultIndex = 0;
      if (val !== undefined) {
        defaultIndex = props.options?.findIndex((item: any) => item?.value === val);
      }
      return defaultIndex < 0 ? 0 : defaultIndex;
    };

    const className = computed(() => `${pickerItemClass.value}`);
    const itemClassName = computed(() => [`${pickerItemClass.value}__item`]);
    const setIndex = (index: number) => {
      if (picker) {
        picker.updateItems();
        picker.updateIndex(index, {
          isChange: false,
        });
      }
    };
    const setValue = (value: number | string | undefined) => {
      if (picker) {
        picker.updateItems();
        picker.updateIndex(getIndexByValue(value), {
          isChange: false,
        });
      }
    };
    const setOptions = () => {
      picker?.update();
    };
    const setUpdateItems = () => {
      picker?.updateItems();
    };
    context.expose({
      setIndex,
      setValue,
      setOptions,
      setUpdateItems,
    });

    onMounted(() => {
      if (root.value) {
        picker = new Picker({
          el: root.value,
          defaultIndex: getIndexByValue(props.value) || 0,
          onChange: (index: number) => {
            const curItem = props.options[index];
            const changeValue = { value: curItem.value, index };
            props.onPick?.(changeValue);
          },
        });
      }
    });

    watch(
      () => props.options,
      () => {
        picker?.updateItems();
      },
      { flush: 'post', deep: true },
    );

    return () => {
      return (
        <ul ref={root} class={className.value}>
          {(props.options || []).map((option, index) => (
            <li key={index} class={itemClassName.value}>
              {context.slots.option ? (
                context.slots.option(option, index)
              ) : (
                <>{props.renderLabel ? props.renderLabel(option) : option?.label}</>
              )}
            </li>
          ))}
        </ul>
      );
    };
  },
});
