import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import style from './style.css'
import Vm from './Vm'
import Pool from './Pool'
import ScrollPositionHistory from '../ScrollPositionHistory'
import { getByPage } from '_/actions'
import { filterVms, sortFunction } from '_/utils'
import InfiniteScroll from 'react-infinite-scroller'
import Loader, { SIZES } from '../Loader'

/**
 * Use Patternfly 'Single Select Card View' pattern to show every VM and Pool
 * available to the current user.
 */
class Vms extends React.Component {
  constructor (props) {
    super(props)
    this.loadMore = this.loadMore.bind(this)
  }

  loadMore () {
    if (this.props.vms.get('notAllPagesLoaded')) {
      this.props.onUpdate(this.props.vms.get('page') + 1)
    }
  }

  render () {
    const { vms, alwaysShowPoolCard } = this.props

    const sort = vms.get('sort').toJS()

    const filters = vms.get('filters').toJS()

    const sortedVms = vms.get('vms').filter(vm => filterVms(vm, filters)).toList().sort(sortFunction(sort))
    const sortedPools = vms.get('pools')
      .filter(pool => alwaysShowPoolCard || (pool.get('vmsCount') < pool.get('maxUserVms') && pool.get('size') > 0 && filterVms(pool, filters)))
      .toList()
      .sort(sortFunction(sort)) // TODO: sort vms and pools together!

    return (
      <InfiniteScroll
        loadMore={this.loadMore}
        isReverse={!sort.isAsc}
        hasMore={vms.get('notAllPagesLoaded')}
        loader={<Loader key='infinite-scroll-loader' size={SIZES.LARGE} />}
        useWindow={false}
      >
        <ScrollPositionHistory uniquePrefix='vms-list' scrollContainerSelector='#page-router-render-component'>
          <div className={`container-fluid container-cards-pf`}>
            <div className={style['scrollingWrapper']}>
              <div className='row row-cards-pf'>
                {sortedVms.map(vm => <Vm vm={vm} key={vm.get('id')} />)}
                {sortedPools.map(pool => <Pool pool={pool} key={pool.get('id')} />)}
              </div>
              <div className={style['overlay']} />
            </div>
          </div>
        </ScrollPositionHistory>
      </InfiniteScroll>
    )
  }
}
Vms.propTypes = {
  vms: PropTypes.object.isRequired,
  alwaysShowPoolCard: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    vms: state.vms,
    alwaysShowPoolCard: !state.config.get('filter'),
  }),
  (dispatch) => ({
    onUpdate: (page) => dispatch(getByPage({ page })),
  })
)(Vms)
