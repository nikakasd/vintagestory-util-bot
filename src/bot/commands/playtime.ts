import { ffetchBase } from '@fuman/fetch'
import type { Dispatcher } from '@mtcute/dispatcher'
import { filters } from '@mtcute/dispatcher'
import type { TelegramClient, TextWithEntities } from '@mtcute/node'
import { html } from '@mtcute/node'
import { joinTextWithEntities } from '@mtcute/node/utils.js'

import config from '../../shared/config.js'
import { isWhitelisted } from '../utilities/is-whitelisted.js'

interface GrafanaResponse {
  results: {
    A: {
      status: number
      frames: {
        data: {
          values: [
            number[],
            string[]
          ]
        }
      }[]
    }
  }
}

export default (client: TelegramClient, dp: Dispatcher) => {
  dp.onNewMessage(filters.and(isWhitelisted, filters.command('playtime')), async (ctx) => {
    const res = await ffetchBase.post('/api/ds/query', {
      baseUrl: config.grafana.url,
      json: {
        queries: [
          {
            datasource: {
              type: 'influxdb',
              uid: config.grafana.datasource,
            },
            query: 'from(bucket: "zachemvs-logs")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "online")\n  |> filter(fn: (r) => r["_field"] == "value")\n  |> count()\n  |> map(fn: (r) => ({ r with\n    _value: r._value * 10\n  }))\n  |> group()\n  |> keep(columns: ["player", "_value"])\n  |> sort(columns: ["_value"], desc: true)',
            refId: 'A',
            intervalMs: 43200000,
            maxDataPoints: 860,
          },
        ],
        from: '0',
        to: Date.now().toString(),
      },
    }).json<GrafanaResponse>()

    const lines: TextWithEntities[] = []

    if (res.results.A.status !== 200) {
      lines.push(html`<b>Error:</b> ${res.results.A.status}`)
    } else {
      const values = res.results.A.frames[0].data.values
      for (let i = 0; i < values[0].length; i++) {
        lines.push(html`<b>${values[1][i]}</b>: ${(values[0][i] / 60 / 60).toFixed(2)} hours`)
      }
    }

    await ctx.answerText(joinTextWithEntities(lines, '\n'))
  })
}
