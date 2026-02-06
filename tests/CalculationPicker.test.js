import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import CalculationPicker from '../src/components/CalculationPicker.vue';
import { getCopy, getLocaleCode } from '../src/i18n';

describe('CalculationPicker', () => {
  it('renders saved calculations and emits actions', async () => {
    const copy = getCopy('nl');
    const wrapper = mount(CalculationPicker, {
      props: {
        calculations: [
          {
            calculationId: 'calc-1',
            address: '',
            updatedAt: '2024-06-01T12:00:00.000Z'
          }
        ],
        activeId: 'calc-1',
        address: '',
        notes: '',
        createdAt: '2024-06-01T10:00:00.000Z',
        updatedAt: '2024-06-01T12:00:00.000Z',
        error: '',
        copy,
        localeCode: getLocaleCode('nl')
      }
    });

    const options = wrapper.findAll('option');
    expect(options.length).toBe(2);
    expect(options[1].text()).toContain(copy.misc.newCalculation);

    const buttons = wrapper.findAll('button');
    const saveButton = buttons.find((button) => button.text() === copy.actions.save);
    expect(saveButton).toBeTruthy();
    await saveButton.trigger('click');
    expect(wrapper.emitted('save')).toBeTruthy();

    const addressInput = wrapper.find('input');
    await addressInput.setValue('Wetstraat 10');
    expect(wrapper.emitted('update:address')?.[0]).toEqual(['Wetstraat 10']);
  });
});
