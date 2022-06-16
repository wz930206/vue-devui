import { shallowRef, ref, computed } from 'vue';
import type { SetupContext } from 'vue';
import { RangeDatePickerProProps, UseRangePickerProReturnType } from '../range-date-picker-types';
import { onClickOutside } from '@vueuse/core';
import type { Dayjs } from 'dayjs';
import { formatDayjsToStr, isDateEquals, getFormatterDate, parserDate } from '../utils';

export default function useRangePickerPro(props: RangeDatePickerProProps, ctx: SetupContext): UseRangePickerProReturnType {
  const containerRef = shallowRef<HTMLElement>();
  const originRef = ref<HTMLElement>();
  const startInputRef = shallowRef<HTMLElement>();
  const endInputRef = shallowRef<HTMLElement>();
  const overlayRef = shallowRef<HTMLElement>();
  const isPanelShow = ref<boolean>(false);
  const placeholder = computed(() => props.placeholder);
  const isMouseEnter = ref<boolean>(false);
  const focusType = ref<string>('start');

  const toggleChange = (bool: boolean) => {
    isPanelShow.value = bool;
    ctx.emit('toggleChange', bool);
  };

  onClickOutside(containerRef, () => {
    toggleChange(false);
  });

  const onFocus = function (type: string) {
    if (!isPanelShow.value) {
      type = 'start';
    }
    focusType.value = type;
    if (focusType.value === 'start') {
      setTimeout(() => {
        startInputRef.value?.focus();
      });
    } else {
      setTimeout(() => {
        endInputRef.value?.focus();
      });
    }
    toggleChange(true);
  };

  const dateValue = computed(() => {
    let start;
    let end;
    if (props.modelValue[0]) {
      start = parserDate(props.modelValue[0], props.format);
    }
    if (props.modelValue[1]) {
      end = parserDate(props.modelValue[1], props.format);
    }
    return [start, end];
  });

  const displayDateValue = computed(() => {
    const startFormatDate = formatDayjsToStr(dateValue.value[0], props.format);
    const endFormatDate = formatDayjsToStr(dateValue.value[1], props.format);
    if (startFormatDate) {
      return endFormatDate ? [startFormatDate, endFormatDate] : [startFormatDate, ''];
    } else if (endFormatDate) {
      return startFormatDate ? [startFormatDate, endFormatDate] : ['', endFormatDate];
    }
    return ['', ''];
  });

  const showCloseIcon = computed(() => isMouseEnter.value && (displayDateValue.value[0] !== '' || displayDateValue.value[1] !== ''));

  const onSelectedDate = (date: Dayjs[], isConfirm?: boolean) => {
    const [startDate, endDate] = date;
    const selectStart = startDate ? startDate.toDate() : startDate;
    const selectEnd = endDate ? endDate.toDate() : endDate;
    const [start, end] = props.modelValue;
    if (!isDateEquals(start, selectStart) || !isDateEquals(end, selectEnd)) {
      const startFormatDate = getFormatterDate(startDate, props.format);
      const endFormatDate = getFormatterDate(endDate, props.format);
      ctx.emit('update:modelValue', [selectStart ? startFormatDate : '', selectEnd ? endFormatDate : '']);
      if (isConfirm) {
        // 回调参数为Date类型
        ctx.emit('confirmEvent', [selectStart, selectEnd]);
        toggleChange(false);
      }
    }
  };

  const handlerClearTime = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    ctx.emit('update:modelValue', ['', '']);
    ctx.emit('confirmEvent', [null, null]);
    // 当面板未关闭时，清空后focusType置位start
    if (isPanelShow.value) {
      focusType.value = 'start';
    }
  };

  const onChangeRangeFocusType = (type: string) => {
    focusType.value = type;
  };

  return {
    containerRef,
    originRef,
    startInputRef,
    endInputRef,
    overlayRef,
    isPanelShow,
    placeholder,
    dateValue,
    displayDateValue,
    isMouseEnter,
    showCloseIcon,
    focusType,
    onFocus,
    onSelectedDate,
    handlerClearTime,
    onChangeRangeFocusType,
  };
}