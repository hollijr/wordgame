import * as React from 'react';
import { DetailsList, DetailsRow, IDetailsRowStyles, IDetailsListProps, DetailsListLayoutMode, Selection, IColumn  } from '@fluentui/react/lib/DetailsList';
import { getTheme } from '@fluentui/react/lib/Styling';
import { Announced } from '@fluentui/react/lib/Announced';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { mergeStyles } from '@fluentui/react/lib/Styling';

const theme = getTheme();

const exampleChildClass = mergeStyles({
    display: 'block',
    marginBottom: '10px',
});
  
const textFieldStyles: Partial<ITextFieldStyles> = { root: { maxWidth: '300px' } };

export interface GridItem {
    key: number|string;
    opcuaName: string;
    opcuaNodeId: string;
    dtName: string;
    dtModelId: string;
}

export interface GridState {
    items: GridItem[];
    selectionDetails: string;
}

export class GridExample extends React.Component<{}, GridState> {
  private _selection: Selection;
  private _items: GridItem[];
  private _columns: IColumn[];

  constructor(props: {}) {
    super(props);


    this._selection = new Selection({
        onSelectionChanged: () => this.setState({ selectionDetails: this._getSelectionDetails() }),
    });

    // Populate with items for demos.
    this._items = [];
    for (let i = 0; i < 200; i++) {
        this._items.push({
            key: i,
            opcuaName: 'Item ' + i,
            opcuaNodeId: i.toString(),
            dtName: 'Item ' + i + 5,
            dtModelId: (i + 5).toString()
        });
    }

    this._columns = [
        { key: 'opcua', name: 'OpcUA', fieldName: 'opcua', minWidth: 100, maxWidth: 200, isResizable: true, onRender: (item) => `${item.opcuaNodeId}` },
        { key: 'arrow', name: '', fieldName: 'arrow', minWidth: 20, maxWidth: 20, isResizable: false, onRender: _ => '->' },
        { key: 'dt', name: 'DT', fieldName: 'dt', minWidth: 100, maxWidth: 200, isResizable: true, onRender: (item) => `${item.dtModelId}` },
    ];

    this.state = {
        items: this._items,
        selectionDetails: this._getSelectionDetails(),
    };
  }

  public render() {
    const { items, selectionDetails } = this.state;

    return (
      <div>
        <div className={exampleChildClass}>{selectionDetails}</div>
        <Announced message={selectionDetails} />
        <TextField
          className={exampleChildClass}
          label="Filter by name:"
          onChange={this._onFilter}
          styles={textFieldStyles}
        />
        <Announced message={`Number of items after filter applied: ${items.length}.`} />
        <MarqueeSelection selection={this._selection}>
            <DetailsList
                items={items}
                columns={this._columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selection={this._selection}
                selectionPreservedOnEmptyClick={true}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="select row"
                onItemInvoked={this._onItemInvoked}
                onRenderRow={this._onRenderRow}
            />
        </MarqueeSelection>
      </div>
    );
  }

  private _onRenderRow: IDetailsListProps['onRenderRow'] = props => {
    const customStyles: Partial<IDetailsRowStyles> = {};
    if (props) {
      if (props.itemIndex % 2 === 0) {
        // Every other row renders with a different background color
        customStyles.root = { backgroundColor: theme.palette.themeLighterAlt };
      }

      return <DetailsRow {...props} styles={customStyles} />;
    }
    return null;
  };

  private _getSelectionDetails(): string {
    const selectionCount = this._selection.getSelectedCount();

    switch (selectionCount) {
      case 0:
        return 'No items selected';
      case 1:
        return '1 item selected: ' + (this._selection.getSelection()[0] as GridItem).key;
      default:
        return `${selectionCount} items selected`;
    }
  }

  private _onFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    this.setState({
      items: text ? this._items.filter(i => i.opcuaNodeId.toLowerCase().indexOf(text) > -1 || i.dtName.toLowerCase().indexOf(text) > -1) : this._items,
    });
  };

  private _onItemInvoked = (item: GridItem): void => {
    alert(`Item invoked: ${item.key}`);
  };
}