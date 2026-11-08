package com.madeats.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {

    @GetMapping("/")
    public String index() {
        return "redirect:https://mad-eats-eight.vercel.app";
    }
}
