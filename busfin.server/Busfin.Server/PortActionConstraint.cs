using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Routing;

namespace Busfin.Server
{
    [AttributeUsage(AttributeTargets.Class)]
    public class PortActionConstraint : ActionMethodSelectorAttribute
    {
        private readonly PortTypes _portType;
        private static readonly Dictionary<PortTypes, int> Ports = new Dictionary<PortTypes, int>();

        public static void AddPort(PortTypes portType, int port)
        {
            Ports[portType] = port;
        }

        public PortActionConstraint(PortTypes portType)
        {
            _portType = portType;
        }

        public override bool IsValidForRequest(RouteContext routeContext, ActionDescriptor action)
        {
            if (Ports.TryGetValue(_portType, out var port))
            {
                return routeContext.HttpContext.Connection.LocalPort == port;
            }

            return true;
        }
    }
}