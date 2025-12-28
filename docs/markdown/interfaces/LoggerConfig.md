[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / LoggerConfig

# Interface: LoggerConfig

Defined in: [src/utils/logger.ts:28](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/utils/logger.ts#L28)

Configuration options for the static Logger class.

 LoggerConfig

## Properties

### level

> **level**: [`LogLevel`](../enumerations/LogLevel.md)

Defined in: [src/utils/logger.ts:33](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/utils/logger.ts#L33)

The minimum log level to output messages for. Messages below this level will be ignored.

***

### prefix?

> `optional` **prefix**: `string`

Defined in: [src/utils/logger.ts:38](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/utils/logger.ts#L38)

An optional prefix string to prepend to all log messages (e.g., '[MyApp]'). Defaults to '[ART]'.
