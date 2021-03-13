import { Component, Injector, Input, OnInit, Type } from '@angular/core';
import { componentWrapperDecorator, moduleMetadata, Story, Meta } from '@storybook/angular';
import { WithoutSelectorComponent, WITHOUT_SELECTOR_DATA } from './without-selector.component';

export default {
  title: 'Basics / Component / without selector / Custom wrapper *NgComponentOutlet',
  component: WithoutSelectorComponent,
  decorators: [
    moduleMetadata({
      entryComponents: [WithoutSelectorComponent],
    }),
  ],
} as Meta;

// Advanced example with custom *ngComponentOutlet

@Component({
  selector: 'ng-component-outlet-wrapper',
  template: `<ng-container
    *ngComponentOutlet="componentOutlet; injector: componentInjector; content: componentContent"
  ></ng-container>`,
})
class NgComponentOutletWrapperComponent implements OnInit {
  @Input()
  componentOutlet: Type<unknown>;

  @Input()
  name: string;

  @Input()
  color: string;

  componentInjector: Injector;

  componentContent = [
    // eslint-disable-next-line no-undef
    [document.createTextNode('Ng-content : Inspired by ')],
    // eslint-disable-next-line no-undef
    [document.createTextNode('https://angular.io/api/common/NgComponentOutlet')],
  ];

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly injector: Injector) {}

  ngOnInit(): void {
    this.componentInjector = Injector.create({
      providers: [
        { provide: WITHOUT_SELECTOR_DATA, useValue: { color: this.color, name: this.name } },
      ],
      parent: this.injector,
    });
  }
}

export const WithCustomNgComponentOutletWrapper: Story = (args) => ({
  props: args,
  // Require a complete rendering to take into account the args change by controls addon.
  renderMode: 'full',
});
WithCustomNgComponentOutletWrapper.storyName = 'Custom wrapper *NgComponentOutlet';
WithCustomNgComponentOutletWrapper.argTypes = {
  name: { control: 'text' },
  color: { control: 'color' },
};
WithCustomNgComponentOutletWrapper.args = { name: 'Dixie Normous', color: 'green' };
WithCustomNgComponentOutletWrapper.decorators = [
  moduleMetadata({
    declarations: [NgComponentOutletWrapperComponent],
  }),
  componentWrapperDecorator(NgComponentOutletWrapperComponent, (args) => ({
    name: args.name,
    color: args.color,
    componentOutlet: WithoutSelectorComponent,
  })),
];
